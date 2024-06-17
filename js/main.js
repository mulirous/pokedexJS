document.getElementById('searchButton').addEventListener('click', function() {
    const pokemonName = document.getElementById('search').value.toLowerCase();
    const pokemonURL = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

    const pokemonImg = document.getElementById('pokemonImg');
    pokemonImg.classList.add('loading-spin');

    fetch(pokemonURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokémon not found!');
            }
            return response.json();
        })
        .then(data => {
            console.log("Pokémon data:", data);

            // Mostra a sideScreen
            document.querySelector('.sideScreen').classList.remove('d-none');

            // Mostra o número da pokedex do Pokémon
            document.getElementById('pokemonDexNumber').textContent = '#' + data.id;

            // Atualiza o nome do Pokémon
            document.getElementById('pokemonName').textContent = capitalizeFirstLetter(data.name);

            // Atualiza a imagem do Pokémon
            pokemonImg.src = data.sprites.front_default;
            pokemonImg.alt = data.name;

            // Remove a classe de animação após o carregamento da imagem
            pokemonImg.classList.remove('loading-spin');

            // Atualiza o tipo do Pokémon
            document.getElementById('pokemonType').textContent = capitalizeFirstLetter(data.types.map(typeInfo => typeInfo.type.name).join(', '));

            // Atualiza as habilidades do Pokémon
            const abilities = data.abilities.map(abilityInfo => abilityInfo.ability.name);
            const abilitiesList = document.getElementById('abilitiesList');
            abilitiesList.innerHTML = ''; // Limpa a lista de habilidades
            abilities.forEach(ability => {
                const abilityItem = document.createElement('p');
                abilityItem.classList.add('col-md-6');
                abilityItem.textContent = capitalizeFirstLetter(ability);
                abilitiesList.appendChild(abilityItem);
            });

            // Atualiza os moves do Pokémon
            const moves = data.moves.slice(0, 4).map(moveInfo => moveInfo.move.name);
            const movesList = document.getElementById('movesList');
            movesList.innerHTML = '';
            moves.forEach(move => {
                const moveItem = document.createElement('p');
                moveItem.classList.add('col-md-6');
                moveItem.textContent = capitalizeFirstLetter(move);
                movesList.appendChild(moveItem);
            })

            // Atualiza os base stats do Pokémon
            document.getElementById('hpBase').textContent = `HP: ${data.stats[0].base_stat}`
            document.getElementById('attackBase').textContent = `Attack: ${data.stats[1].base_stat}`
            document.getElementById('defenseBase').textContent = `Defense: ${data.stats[2].base_stat}`
            document.getElementById('specialAttackBase').textContent = `Special Attack: ${data.stats[3].base_stat}`
            document.getElementById('specialDefenseBase').textContent = `Special Defense: ${data.stats[4].base_stat}`
            document.getElementById('speedBase').textContent = `Speed: ${data.stats[5].base_stat}`

            // Busca informações da espécie do Pokémon
            return fetch(data.species.url);
        })
        .then(response => response.json())
        .then(speciesData => {
            console.log('Species data:', speciesData);

            // Encontra apelido do Pokémon
            const genusEntry = speciesData.genera.find(genus => genus.language.name === 'en');
            if (genusEntry) {
                document.getElementById('pokemonSurname').textContent = capitalizeFirstLetter(genusEntry.genus);
            } else {
                document.getElementById('pokemonSurname').textContent = 'Information not available';
            }

            // Atualiza o habitat do Pokémon
            if(speciesData.pal_park_encounters.length === 0) {
                document.getElementById('pokemonHabitat').textContent = `Undefined`
            }
            else {
                if (speciesData.habitat === null || speciesData.habitat === 'rare') {
                    document.getElementById('pokemonHabitat').textContent = capitalizeFirstLetter(speciesData.pal_park_encounters[0].area.name);
                }
                else {
                    document.getElementById('pokemonHabitat').textContent = capitalizeFirstLetter(speciesData.habitat.name);
                }
            }
            
            // Atualiza a trajetória de evolução do Pokémon
            if (speciesData.evolves_from_species !== null) {
                document.getElementById('evolveFrom').textContent = `Evolves from: ${capitalizeFirstLetter(speciesData.evolves_from_species.name)}`;
            }
            else document.getElementById('evolveFrom').textContent = " ";

            // Atualiza o status de lendário e mitico
            document.getElementById('pokemonLegendary').textContent = speciesData.is_legendary ? 'Yes' : 'No';
            document.getElementById('pokemonMythical').textContent = speciesData.is_mythical ? 'Yes' : 'No';
            
            
            // Atualiza a descrição do Pokémon
            const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
            document.getElementById('pokemonInfo').textContent = description;

            return fetch(speciesData.generation.url)
        })
        .then(response => response.json())
        .then(generationData => {
            console.log("Generation data: ", generationData);

            // Atualiza a região original do pokemon
            document.getElementById("pokemonRegion").textContent = capitalizeFirstLetter(generationData.main_region.name);

        })
        .catch(error => { //Tratamento de erros
            console.error('Error fetching Pokémon data:', error);
            alert('Pokémon not found!');
        });
});

document.getElementById('search').addEventListener('input', function() {
    const query = this.value.toLowerCase();

    if (query.length < 2) {
        document.getElementById('searchSuggestions').style.display = 'none';
        return;
    }
    
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
        .then(response => response.json())
        .then(data => {
            const suggestions = data.results.filter(pokemon => pokemon.name.startsWith(query));
            const suggestionsContainer = document.getElementById('searchSuggestions');
            suggestionsContainer.innerHTML = '';

            suggestions.forEach(suggestion => {
                fetch(`https://pokeapi.co/api/v2/pokemon/${suggestion.name}`)
                    .then(response => response.json())
                    .then(pokemonData => {
                        const item = document.createElement('div');
                        item.className = 'dropdown-item';

                        const img = document.createElement('img');
                        if (pokemonData.sprites.back_default === null) {
                            img.src = pokemonData.sprites.front_default;
                        }
                        else {
                           img.src = pokemonData.sprites.back_default; 
                        }
                        img.alt = suggestion.name;

                        const text = document.createElement('span');
                        text.textContent = capitalizeFirstLetter(suggestion.name);

                        item.appendChild(img);
                        item.appendChild(text);

                        item.addEventListener('click', function() {
                            document.getElementById('search').value = suggestion.name;
                            suggestionsContainer.style.display = 'none';
                        });

                        suggestionsContainer.appendChild(item);
                    });
            });

            suggestionsContainer.style.display = suggestions.length ? 'block' : 'none';
        });
});

function capitalizeFirstLetter(string) {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}