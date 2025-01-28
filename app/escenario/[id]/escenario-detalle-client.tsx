// Reemplaza todas las instancias de 'any' con tipos más específicos
// Por ejemplo:
type Item = {
  id: number
  nombre: string
  cantidad: number
  seccion: string
}

type Escenario = {
  id: string
  nombre: string
  // Añade aquí el resto de propiedades del escenario
}

// Luego, usa estos tipos en lugar de 'any'
const [items, setItems] = useState<Item[]>([])

//Para solucionar el error "This hook is being called conditionally, but all hooks must be called in the exact same order in every component render."
// Asegúrate de que el useState se llama incondicionalmente dentro del componente.  Si la llamada a useState está dentro de una condición, mueve la declaración fuera de la condición.

//Ejemplo:
//En lugar de:
//if (condición) {
//  const [items, setItems] = useState<Item[]>([]);
//}

//Haz esto:
const [items, setItems] = useState<Item[]>([])
//if (condición) {
//  //Usa items y setItems aquí
//}

// ... y así sucesivamente para las demás instancias

