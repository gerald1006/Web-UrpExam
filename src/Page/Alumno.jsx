import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from "@mui/icons-material";

export default function Alumno() {
  return (
    <Box sx={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "#388E3C" }}>
        <Toolbar>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Exámenes Pasados
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", sm: "100px" },
            backgroundColor: "#262529",
            color: "white",
            padding: 5,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Informática
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HomeIcon />
            <Typography variant="body1">Inicio</Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, padding: 3, overflow: "auto" }}>
          {/* Filters */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              flexWrap: "wrap",
              gap: 2
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontWeight: "bold" }}>Ciclo:</Typography>
              <Select defaultValue="" size="small" sx={{ minWidth: 140 }}>
                <MenuItem value="">Seleccionar</MenuItem>
                {Array.from({ length: 10 }, (_, i) => (
                  <MenuItem key={i} value={`Ciclo ${i + 1}`}>
                    Ciclo {i + 1}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <TextField
              size="small"
              placeholder="Buscar examen, curso..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: 250 }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#4CAF50" }}>
                  {["Curso", "Examen", "Carrera", "Ciclo", "Profesor", "Archivo"].map((header) => (
                    <TableCell key={header} sx={{ color: "white", fontWeight: "bold" }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell>Curso 1</TableCell>
                  <TableCell>Examen Final</TableCell>
                  <TableCell>Ingeniería Informática</TableCell>
                  <TableCell>Ciclo 3</TableCell>
                  <TableCell>Dr. Ramírez</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<DownloadIcon />}
                    >
                      Descargar
                    </Button>
                  </TableCell>
                </TableRow>
                {/* Agrega más filas aquí si lo necesitas */}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}