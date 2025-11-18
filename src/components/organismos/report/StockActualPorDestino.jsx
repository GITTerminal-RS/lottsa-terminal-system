import styled from "styled-components";
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer } from "@react-pdf/renderer"
import { ListaGenerica, useOperadoraStore, useDestinosStore } from "../../../index";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const PROVINCIAS = [
    "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi",
    "Esmeraldas", "El Oro", "Galápagos", "Guayas", "Imbabura", "Loja",
    "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza",
    "Pichincha", "Santo Domingo de los Tsáchilas", "Santa Elena", "Sucumbíos",
    "Tungurahua", "Zamora Chinchipe", "Perú", "Colombia"
];

function StockActualPorDestino() {
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
    const { reportStockDestinosTodos, buscardestinos, mostrardestinos } = useDestinosStore();
    const { dataoperadora, tieneOperadoraValida } = useOperadoraStore();

    const isOperadoraValid = tieneOperadoraValida();

    // Obtener el nombre de la operadora
    const nombreOperadora = dataoperadora?.nombre || '';

    console.log("Datos de la operadora:", {
        dataoperadora,
        nombreOperadora,
        descripcion: dataoperadora?.descripcion,
        nombre: dataoperadora?.nombre
    });

    // Función auxiliar para normalizar el texto de la provincia
    const normalizarProvincia = (texto) => {
        if (!texto || typeof texto !== 'string') {
            console.error("Texto inválido para normalizar en componente:", texto);
            return '';
        }
        try {
            const normalizado = texto
                .toLowerCase()
                .trim();
            console.log(`Normalizando provincia en componente: "${texto}" -> "${normalizado}"`);
            return normalizado;
        } catch (error) {
            console.error("Error al normalizar provincia en componente:", error);
            return texto.toLowerCase().trim();
        }
    };

    // Primero obtenemos los destinos filtrados por provincia
    const { 
        data: destinosFiltrados,
        isLoading: isLoadingDestinos,
        error: errorDestinos
    } = useQuery({
        queryKey: ["destinos por provincia", { 
            _id_operadora: dataoperadora?.id, 
            provincia: provinciaSeleccionada
        }],
        queryFn: async () => {
            console.log("Componente - Estado completo:", {
                dataoperadora,
                isOperadoraValid,
                provinciaSeleccionada,
                tipoOperadora: typeof dataoperadora?.id,
                valorOperadora: dataoperadora?.id
            });

            if (!isOperadoraValid) {
                throw new Error("Operadora no válida");
            }

            if (!dataoperadora?.id) {
                throw new Error("ID de operadora no proporcionado");
            }

            if (!provinciaSeleccionada) {
                throw new Error("Seleccione una provincia");
            }

            try {
                // Primero obtenemos todos los destinos para ver qué hay
                const todosLosDestinos = await mostrardestinos({ 
                    id_operadora: dataoperadora.id 
                });
                console.log("Componente - Todos los destinos disponibles:", {
                    total: todosLosDestinos?.length || 0,
                    destinos: todosLosDestinos
                });

                // Luego intentamos la búsqueda por provincia
                const provinciaNormalizadaParaBusqueda = normalizarProvincia(provinciaSeleccionada);
                console.log("Provincia normalizada para búsqueda:", provinciaNormalizadaParaBusqueda);
                const destinos = await buscardestinos({
                    _id_operadora: dataoperadora.id,
                    provincia: provinciaNormalizadaParaBusqueda,
                });

                console.log("Componente - Resultado de búsqueda:", {
                    provinciaBuscada: provinciaSeleccionada,
                    destinosEncontrados: destinos,
                    totalDestinos: todosLosDestinos?.length || 0
                });

                if (!destinos || destinos.length === 0) {
                    throw new Error("No se encontraron destinos para la provincia seleccionada");
                }

                return destinos;
            } catch (error) {
                console.error("Componente - Error detallado:", {
                    error,
                    mensaje: error.message,
                    stack: error.stack
                });
                throw error;
            }
        },
        enabled: isOperadoraValid && Boolean(provinciaSeleccionada),
        retry: false
    });

    // Luego obtenemos el reporte solo para los destinos filtrados
    const { 
        data: reporteData,
        isLoading: isLoadingReporte,
        error: errorReporte
    } = useQuery({
        queryKey: ["reporte stock por destinos", { 
            _id_operadora: dataoperadora?.id,
            destinos: destinosFiltrados?.map(d => d.id)
        }],
        queryFn: async () => {
            console.log("Iniciando obtención de reporte con:", {
                _id_operadora: dataoperadora?.id,
                destinosIds: destinosFiltrados?.map(d => d.id),
                destinosFiltrados
            });

            if (!destinosFiltrados || !Array.isArray(destinosFiltrados) || destinosFiltrados.length === 0) {
                console.log("No hay destinos filtrados para obtener el reporte");
                return [];
            }

            try {
                const reporte = await reportStockDestinosTodos({ 
                    _id_operadora: dataoperadora.id
                });

                console.log("Reporte completo obtenido:", {
                    total: reporte?.length || 0,
                    reporte: reporte
                });

                if (!reporte || !Array.isArray(reporte)) {
                    throw new Error("Formato de reporte inválido");
                }

                // Filtramos el reporte usando los IDs de los destinos
                const reporteFiltrado = reporte.filter(item => {
                    if (!item || !item.id_destino) {
                        console.warn("Item de reporte inválido:", item);
                        return false;
                    }
                    const coincide = destinosFiltrados.some(destino => {
                        if (!destino || !destino.id) {
                            console.warn("Destino inválido en filtrado:", destino);
                            return false;
                        }
                        const match = destino.id === item.id_destino;
                        console.log(`Comparando destino en reporte:`, {
                            destinoId: destino.id,
                            reporteId: item.id_destino,
                            coincide: match
                        });
                        return match;
                    });
                    return coincide;
                });

                console.log("Reporte filtrado:", {
                    total: reporteFiltrado?.length || 0,
                    reporte: reporteFiltrado
                });

                return reporteFiltrado;
            } catch (error) {
                console.error("Error al obtener reporte:", error);
                throw error;
            }
        },
        enabled: Boolean(destinosFiltrados?.length),
        retry: false
    });

    const handleProvinciaChange = (e) => {
        const nuevaProvincia = e.target.value;
        console.log("Cambiando provincia a:", nuevaProvincia);
        if (nuevaProvincia) {
            setProvinciaSeleccionada(nuevaProvincia);
        } else {
            setProvinciaSeleccionada("");
        }
    };

    Font.register({
        family: "Inconsolata",
        src: "http://fonts.gstatic.com/s/inconsolata/v15/7bMKuoy6Nh0ft0SHnIGMuaCWcynf_cDxXwCLxiixG1c.ttf",
    });

    const styles = StyleSheet.create({
        page: { 
            flexDirection: "column",
            padding: 30
        },
        header: {
            marginBottom: 20,
            textAlign: 'center'
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 5,
            textAlign: 'center'
        },
        subtitle: {
            fontSize: 16,
            marginBottom: 5,
            textAlign: 'center'
        },
        date: {
            fontSize: 12,
            marginBottom: 20,
            textAlign: 'center'
        },
        table: { 
            width: "100%",
            marginTop: 10,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#000'
        },
        row: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#000",
            minHeight: 30,
            alignItems: 'stretch'
        },
        headerRow: {
            backgroundColor: "#f0f0f0"
        },
        cellBase: {
            padding: 5,
            fontFamily: "Inconsolata",
            fontSize: 12,
            borderRightWidth: 1,
            borderRightColor: "#000",
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        cellDestino: { 
            flex: 2.5,
            justifyContent: 'flex-start',
            paddingLeft: 10
        },
        cellProvincia: { 
            flex: 1,
            justifyContent: 'center'
        },
        cellHorario: { 
            flex: 1,
            justifyContent: 'center'
        },
        cellRuta: { 
            flex: 1.5,
            justifyContent: 'flex-start',
            paddingLeft: 10
        },
        cellPrecio: { 
            flex: 0.8,
            justifyContent: 'flex-end',
            paddingRight: 10
        },
        cellFrecuencia: { 
            flex: 1,
            justifyContent: 'center'
        },
        headerText: {
            fontWeight: 'bold',
            fontSize: 12
        },
        cellText: {
            fontSize: 12
        }
    });

    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

    const isLoading = isLoadingDestinos || isLoadingReporte;
    const error = errorDestinos || errorReporte;

    console.log("Estado actual:", {
        provinciaSeleccionada,
        isOperadoraValid,
        dataoperadora: dataoperadora?.id,
        destinosFiltrados,
        reporteData,
        isLoading,
        error: error?.message
    });

    return (
        <Container>
            {!isOperadoraValid ? (
                <ErrorContainer>
                    <ErrorMessage>
                        Por favor, seleccione una operadora primero. 
                        {!dataoperadora ? " No hay operadora seleccionada." : 
                         !dataoperadora.id ? " La operadora seleccionada no es válida." : ""}
                    </ErrorMessage>
                </ErrorContainer>
            ) : (
                <>
                    <SearchContainer>
                        <TitleContainer>
                            <SearchTitle>Seleccione una provincia</SearchTitle>
                        </TitleContainer>
                        <SelectContainer>
                            <Select 
                                value={provinciaSeleccionada}
                                onChange={handleProvinciaChange}
                                disabled={!isOperadoraValid}
                            >
                                <option value="">Seleccione una provincia</option>
                                {PROVINCIAS.map((provincia) => (
                                    <option key={provincia} value={provincia}>
                                        {provincia}
                                    </option>
                                ))}
                            </Select>
                        </SelectContainer>
                    </SearchContainer>
                    
                    {isLoading && (
                        <LoadingMessage>Generando reporte...</LoadingMessage>
                    )}

                    {error && (
                        <ErrorMessage>
                            {error.message === "ID de operadora no proporcionado" 
                                ? "Por favor, seleccione una operadora primero"
                                : error.message === "Seleccione una provincia"
                                ? "Por favor, seleccione una provincia"
                                : error.message}
                        </ErrorMessage>
                    )}
                    
                    {reporteData && reporteData.length > 0 && (
            <PDFViewer className="pdfviewer">
                            <Document title={nombreOperadora}>
                                <Page size="A4" orientation="landscape">
                        <View style={styles.page}>
                                        <View style={styles.header}>
                                            <Text style={styles.title}>{nombreOperadora}</Text>
                                            <Text style={styles.subtitle}>Provincia: {provinciaSeleccionada}</Text>
                                            <Text style={styles.date}>Fecha y hora del reporte: {formattedDate}</Text>
                                        </View>

                                        <View style={styles.table}>
                                            {/* Encabezado de la tabla */}
                                            <View style={[styles.row, styles.headerRow]}>
                                                <View style={[styles.cellBase, styles.cellDestino]}>
                                                    <Text style={styles.headerText}>Destino</Text>
                                                </View>
                                                <View style={[styles.cellBase, styles.cellProvincia]}>
                                                    <Text style={styles.headerText}>Provincia</Text>
                                                </View>
                                                <View style={[styles.cellBase, styles.cellHorario]}>
                                                    <Text style={styles.headerText}>Horario</Text>
                                                </View>
                                                <View style={[styles.cellBase, styles.cellRuta]}>
                                                    <Text style={styles.headerText}>Ruta</Text>
                                                </View>
                                                <View style={[styles.cellBase, styles.cellPrecio]}>
                                                    <Text style={styles.headerText}>Precio</Text>
                                                </View>
                                                <View style={[styles.cellBase, styles.cellFrecuencia]}>
                                                    <Text style={styles.headerText}>Frecuencia de paso</Text>
                                                </View>
                                            </View>

                                            {/* Filas de datos */}
                                            {reporteData.map((destino, index) => (
                                                <View key={index} style={styles.row}>
                                                    <View style={[styles.cellBase, styles.cellDestino]}>
                                                        <Text style={styles.cellText}>{destino.descripcion_destino}</Text>
                                                    </View>
                                                    <View style={[styles.cellBase, styles.cellProvincia]}>
                                                        <Text style={styles.cellText}>{destino.provincia_destino}</Text>
                                                    </View>
                                                    <View style={[styles.cellBase, styles.cellHorario]}>
                                                        <Text style={styles.cellText}>{destino.descripcion_horario}</Text>
                                                    </View>
                                                    <View style={[styles.cellBase, styles.cellRuta]}>
                                                        <Text style={styles.cellText}>{destino.descripcion_ruta}</Text>
                                                    </View>
                                                    <View style={[styles.cellBase, styles.cellPrecio]}>
                                                        <Text style={styles.cellText}>
                                                            ${destino.precio_ruta?.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                    <View style={[styles.cellBase, styles.cellFrecuencia]}>
                                                        <Text style={styles.cellText}>
                                                            {destino.frecuenciapaso || ''}
                                                        </Text>
                                                    </View>
                                </View>
                                            ))}
                            </View>
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
                    )}
                </>
            )}
        </Container>
    );
}

const Container = styled.div` 
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 15px;
    .pdfviewer{
        width: 100%;
        height: calc(100vh - 100px);
        min-height: 600px;
    }
    `;

const SearchContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    background-color: ${({ theme }) => theme.bgcards};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const TitleContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    width: 100%;
`;

const SearchTitle = styled.h3`
    color: ${({ theme }) => theme.colortitlecard};
    font-size: 1.1em;
    margin: 0;
    text-align: left;
`;

const SelectContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    width: 100%;
`;

const Select = styled.select`
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.bg5};
    background-color: ${({ theme }) => theme.bgcards};
    color: ${({ theme }) => theme.colortitlecard};
    font-size: 14px;
    width: 250px;
    cursor: pointer;
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.bg5};
        box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    option {
        background-color: ${({ theme }) => theme.bgcards};
        color: ${({ theme }) => theme.colortitlecard};
    }
`;

const ErrorContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: ${({ theme }) => theme.bgcards};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ErrorMessage = styled.div`
    color: #dc3545;
    font-size: 14px;
    text-align: center;
`;

const LoadingMessage = styled.div`
    color: ${({ theme }) => theme.colortitlecard};
    font-size: 14px;
    text-align: center;
    padding: 10px;
`;

export default StockActualPorDestino;