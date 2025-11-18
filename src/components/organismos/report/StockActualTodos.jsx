import styled from "styled-components";
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer } from "@react-pdf/renderer"
import { useOperadoraStore, useDestinosStore } from "../../../index";
import { useQuery } from "@tanstack/react-query";

function StockActualTodos() {
    const { reportStockDestinosTodos } = useDestinosStore();
    const { dataoperadora } = useOperadoraStore();
    const { data, isLoading, error } = useQuery({
        queryKey: ["reporte stock todos", { _id_operadora: dataoperadora?.id }],
        queryFn: () => reportStockDestinosTodos({ _id_operadora: dataoperadora?.id }), 
        enabled: !!dataoperadora
    });

    if (isLoading)
        return <span>Cargando...</span>;
    if (error) {
        return <span>Error al cargar los datos, {error.message}</span>;
    }

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
        // Estilos base para todas las celdas
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
        // Estilos específicos para cada columna
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
        // Estilo para el encabezado
        headerCell: {
            backgroundColor: "#f0f0f0",
            fontWeight: "bold"
        },
        headerText: {
            fontSize: 12,
            fontWeight: "bold"
        }
    });

    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    const operadoraInfo = data?.[0] || {};

    const renderTableRow = (rowData, isHeader = false) => (
        <View style={styles.row} key={rowData.id_destino || 'header'}>
            <View style={[
                styles.cellBase,
                styles.cellDestino,
                isHeader && styles.headerCell
            ]}>
                <Text style={styles.headerText}>{rowData.descripcion_destino || 'Destino'}</Text>
            </View>
            <View style={[
                styles.cellBase,
                styles.cellProvincia,
                isHeader && styles.headerCell
            ]}>
                <Text style={styles.headerText}>{rowData.provincia_destino || 'Provincia'}</Text>
            </View>
            <View style={[
                styles.cellBase,
                styles.cellHorario,
                isHeader && styles.headerCell
            ]}>
                <Text style={styles.headerText}>{rowData.descripcion_horario || 'Horario'}</Text>
            </View>
            <View style={[
                styles.cellBase,
                styles.cellRuta,
                isHeader && styles.headerCell
            ]}>
                <Text style={styles.headerText}>{rowData.descripcion_ruta || 'Ruta'}</Text>
            </View>
            <View style={[
                styles.cellBase,
                styles.cellPrecio,
                isHeader && styles.headerCell
            ]}>
                <Text style={styles.headerText}>{rowData.precio_ruta ? `$${rowData.precio_ruta.toFixed(2)}` : 'Precio'}</Text>
            </View>
            <View style={[
                styles.cellBase,
                styles.cellFrecuencia,
                isHeader && styles.headerCell
            ]}>
                <Text style={styles.headerText}>{isHeader ? 'Frecuencia de paso' : (rowData.frecuenciapaso || '')}</Text>
            </View>
        </View>
    );

    return (
        <Container>
            <PDFViewer className="pdfviewer">
                <Document title="Reporte de Destinos">
                    <Page size="A4" orientation="landscape">
                        <View style={styles.page}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{operadoraInfo.nombre_operadora || 'Reporte de Destinos'}</Text>
                                <Text style={styles.subtitle}>Dirigente: {operadoraInfo.dirigente || 'No especificado'}</Text>
                                <Text style={styles.date}>Fecha y hora del reporte: {formattedDate}</Text>
                            </View>
                            <View style={styles.table}>
                                {renderTableRow({}, true)}
                                {data?.map((item) => renderTableRow(item))}
                            </View>
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        </Container>
    )
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

export default StockActualTodos;