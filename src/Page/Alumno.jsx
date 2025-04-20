import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";

export default function Alumno() {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener los datos de la tabla "examenes"
  useEffect(() => {
    const fetchExamenes = async () => {
      const { data, error } = await supabase.from("examenes").select("*");
      if (error) {
        console.error("Error al obtener exámenes:", error.message);
      } else {
        setExamenes(data);
      }
      setLoading(false);
    };

    fetchExamenes();
  }, []);

  return (
    <Box
      sx={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "#388E3C" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Exámenes - Alumno
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, padding: 3, overflow: "auto" }}>
        {/* Tabla de exámenes */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#4CAF50" }}>
                {["Curso", "Tipo", "Ciclo", "Archivo"].map((header) => (
                  <TableCell key={header} sx={{ color: "white", fontWeight: "bold" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : examenes.length > 0 ? (
                examenes.map((examen) => (
                  <TableRow key={examen.id} hover>
                    <TableCell>{examen.curso}</TableCell>
                    <TableCell>{examen.tipo}</TableCell>
                    <TableCell>{examen.ciclo}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        href={examen.archivo_url}
                        target="_blank"
                      >
                        Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay exámenes disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}