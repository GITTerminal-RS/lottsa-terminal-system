import { v } from "../styles/variables";
import {
  AiOutlineHome,
  AiOutlineSetting,
} from "react-icons/ai";

export const DesplegableUser = [
  {
    text: "Personal",
    icono: <v.iconoUser/>,
    tipo: "mipersonal",
  },
  {
    text: "Configuracion",
    icono: <v.iconoSettings/>,
    tipo: "configuracion",
  },
  {
    text: "Cerrar sesión",
    icono: <v.iconoCerrarSesion/>,
    tipo: "cerrarsesion",
  },
];



//data SIDEBAR
export const LinksArray = [
  {
    label: "Home",
    icon: <AiOutlineHome />,
    to: "/gestion",
  },
  //{
    //label: "Kardex",
    //icon: <v.iconohorarios />,
    //to: "/kardex",
  //},
  {
    label: "Reportes",
    icon: <v.iconoreportes />,
    to: "/reportes",
  },
 
];
export const SecondarylinksArray = [
  {
    label: "Configuración",
    icon: <AiOutlineSetting />,
    to: "/configurar",
  },
  {
    label: "Cambiar clave",
    icon: <v.iconopass />,
    to: "/cclave",
  },
];
//temas
export const TemasData = [
  {
    icono: "🌞",
    descripcion: "light",
   
  },
  {
    icono: "🌚",
    descripcion: "dark",
    
  },
];

//data configuracion
export const DataModulosConfiguracion =[
  {
    title:"Destinos",
    subtitle:"registra tus destinos",
    icono:"https://i.ibb.co/Y4S848XV/image-removebg-preview.png",
    link:"/configurar/destinos",
   
  },
  {
    title:"Personal",
    subtitle:"ten el control de tu personal",
    icono:"https://i.ibb.co/Q7mtJY6q/us-removebg-preview.png",
    link:"/configurar/personal",
   
  },

  {
    title:"Tu operadora",
    subtitle:"configura tus opciones básicas",
    icono:"https://i.ibb.co/DfLR85tC/lg-removebg-preview.png",
    link:"/configurar/operadora",
    
  },
  {
    title:"Horario de destinos",
    subtitle:"asigna horarios a tus destinos",
    icono:"https://i.ibb.co/Mk9W4R5K/hr.png",
    link:"/configurar/horarios",
    
  },
  {
    title:"Ruta de destinos",
    subtitle:"gestiona tus rutas",
    icono:"https://i.ibb.co/whXK3Kk6/ruta-removebg-preview-1.png",
    link:"/configurar/ruta",
   
  },
  {
    title: "Cartelera cultural y turística",
    subtitle: "gestiona la cartelera",
    icono: "https://i.ibb.co/0yHb34p4/4566013.png",
    link: "/configurar/cartelera",
  },
  {
    title: "Boletín del viajero",
    subtitle: "gestiona las noticias",
    icono: "https://i.ibb.co/qMH9LYp6/noticias.png",
    link: "/configurar/noticias",
  },
  {
    title: "Malla publicitaria",
    subtitle: "gestiona la malla",
    icono: "https://i.ibb.co/5gSNjbws/malla.png",
    link: "/configurar/malla",
  },
  {
    title: "Publicidad",
    subtitle: "gestiona la publicidad",
    icono: "https://i.ibb.co/7tBsSHjQ/2301830.png",
    link: "/configurar/publicidad",
  },
]
//tipo usuario
export const TipouserData = [
  {
    descripcion: "empleado",
    icono: "🪖",
  },
  {
    descripcion: "administrador",
    icono: "👑",
  },
  // El tipo 'root' existe pero no se muestra en formularios normales
  // {
  //   descripcion: "root",
  //   icono: "🦸‍♂️",
  // },
];
//tipodoc
export const TipoDocData = [
  {
    descripcion: "CI",
    icono: "🪖",
  },
  {
    descripcion: "Otros",
    icono: "👑",
  },
];