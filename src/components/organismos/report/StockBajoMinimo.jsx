import styled from "styled-components";
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer } from "@react-pdf/renderer"
import { useOperadoraStore, useDestinosStore } from "../../../index";
import { useQuery } from "@tanstack/react-query";

function StockBajoMinimo() {
    const { reportBajoMinimo } = useDestinosStore();
    const { dataoperadora } = useOperadoraStore();
    const { data, isLoading, error } = useQuery({
        queryKey: ["reporte stock bajo minimo", { _id_operadora: dataoperadora?.id }],
        queryFn: () => reportBajoMinimo({ _id_operadora: dataoperadora?.id }), enabled: !!dataoperadora
    });

    Font.register({
        family: "Inconsolata",
        src: "http://fonts.gstatic.com/s/inconsolata/v15/7bMKuoy6Nh0ft0SHnIGMuaCWcynf_cDxXwCLxiixG1c.ttf",
    });

    const styles = StyleSheet.create({
        page: { flexDirection: "row" },
        section: { margin: 10, padding: 10, flexGrow: 1 },
        table: { width: "100%", margin: "auto", marginTop: 10 },
        row: {
            flexDirection: "row",
            borderBottom: 1,
            borderBottomColor: "#121212",
            //alignItems: "stretch",
            height: 24,
            borderLeftColor: "#000",
            borderLeft: 1,
            textAlign: "left",
            justifyContent: "flex-start",
            alignItems: 'center',
        },
        cell: {
            flex: 1, textAlign: "left", fontFamily: "Inconsolata", borderLeftColor: "#000", justifyContent: "flex-start",
            alignItems: 'center',
        },
        headerCell: {
            flex: 1, backgroundColor: "#dcdcdc", fontWeight: "bold", fontFamily: "Inconsolata", textAlign: "left", justifyContent: "flex-start",
            alignItems: 'center',
        },
    });
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
    const renderTableRow = (rowData, isHeader = false) => (
        <View style={styles.row} key={rowData.id}>
            <Text style={[styles.cell, isHeader && styles.headerCell]}>{rowData.descripcion}</Text>
            <Text style={[styles.cell, isHeader && styles.headerCell]}>{rowData.stock}</Text>
            <Text style={[styles.cell, isHeader && styles.headerCell]}>{rowData.stock_minimo}</Text>
        </View>
    );
    console.log("DATA QUE LLEGA:", JSON.stringify(data, null, 2));

    return (
        <Container>
            <PDFViewer className="pdfviewer">
                <Document title="Todos los destinos" >
                    <Page size="A4" orientation="portrait" >
                        <View style={styles.page}>
                            <View style={styles.section}>
                                <Text style={{ fontSize: 18, fontWeight: "ultrabold", marginBottom: 10 }}>Stock bajo minimo</Text>
                                <Text >Fecha y hora del reporte: {formattedDate}</Text>
                                <View>
                                    {
                                        renderTableRow({ descripcion: "Destino", stock: "Stock", stock_minimo: "Stock minimo"  }, true)
                                    }
                                    {
                                        data?.map((item) => renderTableRow(item))
                                    }
                                </View>
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
    .pdfviewer{
        width: 100%;
        height: 100vh;
    }
    `;
export default StockBajoMinimo;