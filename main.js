//Url mockapi
const url = "http://127.0.0.1:5010/pokemon";

//Traigo pokeapi 
const vengaPokemon = async () => {
  const res = await (await fetch("http://127.0.0.1:5010/pokemon?limit=500")).json();
  return res.results.map(pokemon => pokemon.name);
}

const pokemon = async () => {
  const nombres = await vengaPokemon();
  const principal = document.querySelector("section");

  for (const name of nombres) {

    const res = await (await fetch(`http://127.0.0.1:5010/pokemon/${name}`)).json();

    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${res.sprites.front_default}"/>  
      <button class="botones" id="principal" src="${res.sprites.front_default}"><h2 id="h2">${name}</h2></button>
      <img src="${res.sprites.front_default}"/>
    `;

    principal.appendChild(div);

    const muestreBoton = div.querySelector(".botones");
    muestreBoton.addEventListener("click", async () => {
      
      const imageUrl = res.sprites.front_default;
      
      const nombrePokemon = res.name;

      // Comprobar si el Pokémon ya existe en la API mock
      const existeEnMockApi = await verificarExistenciaPokemonEnMockApi(nombrePokemon);

      Swal.fire({
        title: `${nombrePokemon}`,
        imageUrl: imageUrl,
        imageAlt: "Imagen del Pokémon",
        html: `
          <form id="formulario-${nombrePokemon}">
            ${res.stats.map((data) =>`
              <div>
                <input type="range" value="${data.base_stat}" name="${data.stat.name}">
                <label data-name="${data.stat.name}"><b>${data.base_stat}</b> <b>${data.stat.name}</b></label><br>
              </div>
            `).join("")}
            <input type="submit" class="segundo_boton" value="${existeEnMockApi ? 'Actualizar' : 'Guardar'}"/> 
          </form>
        `,
        imageWidth: "80%",
        imageHeight: "80%"
      });        //Si existe llama la funcion actualizar o sino llama la funcion guardar

      const formulario = document.querySelector(`#formulario-${nombrePokemon}`);
      formulario.addEventListener("submit", async (e) => {
        e.preventDefault();
        const enviar = Object.fromEntries(new FormData(e.target)); //Crear un nuevo json con la data 
        
        try {
          if (existeEnMockApi) {
            // Si el Pokémon existe en la API mock, actualizar
            const config = {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(enviar)
            };
            const response = await fetch(`${url}/${nombrePokemon}`, config);

            if (response.ok) {
              console.log("Datos actualizados");
            } else {
              console.error("Error al actualizar datos en la API");
            }
          } else {
            // Si el Pokémon no existe en la API mock, crear uno nuevo
            const config = {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name: nombrePokemon, ...enviar })
            };
            const response = await fetch(url, config);

            if (response.ok) {
              console.log("Nuevo Pokémon creado con éxito");
            } else {
              console.error("Error al crear un nuevo Pokémon en la API");
            }
          }
        } catch (error) {
          console.error("Error al interactuar con la API mock:", error);
        }
      });

      let contenedor = document.querySelector('#swal2-html-container');
      contenedor.addEventListener("input", (e) => {
        let hermano = e.target.nextElementSibling;
        hermano.innerHTML = `<b>${e.target.value}</b> ${hermano.dataset.name}`;
      });
    });
  }
}

// Función para verificar si un Pokémon existe en la API mock
const verificarExistenciaPokemonEnMockApi = async (nombrePokemon) => {
  try {
    const response = await fetch(`${url}?name=${nombrePokemon}`);
    const data = await response.json();
    return data.length > 0; //Retorna el tamaño del json
  } catch (error) {
    console.error("Error al verificar existencia del Pokémon en la API", error);
    return false;
  }
}

pokemon();

