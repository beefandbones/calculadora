/* --- DATOS Y CONFIGURACIÓN --- */
const THEME = {
    dog: { primary: '#FF8F00', light: '#FFF8E1' },
    cat: { primary: '#9C27B0', light: '#F3E5F5' }
};

const DOG_CONSTANTS = {
    RER_BASE: 70, DENSITY: 1.7,
    ACT: {
        weight_loss: { val: 1.0, label: "A Dieta", icon: "arrow-down-circle" },
        sedentary: { val: 1.2, label: "Tranquilo", icon: "armchair" },
        active: { val: 1.6, label: "Juguetón", icon: "bone" },
        very_active: { val: 2.0, label: "Atleta", icon: "trophy" }
    },
    DIET: { lean_meat: 0.45, bony_parts: 0.15, liver: 0.05, other_organs: 0.10, whole_fish: 0.10, vegetables: 0.15 }
};

const CAT_CONSTANTS = {
    RER_BASE: 40, DENSITY: 1.9,
    ACT: {
        weight_loss: { val: 0.8, label: "A Dieta", icon: "arrow-down-circle" },
        indoor: { val: 1.0, label: "Casero", icon: "home" },
        active: { val: 1.2, label: "Cazador", icon: "cat" },
        outdoor: { val: 1.4, label: "Aventurero", icon: "mountain" }
    },
    DIET: { lean_meat: 0.50, bony_parts: 0.10, liver: 0.10, heart: 0.15, whole_fish: 0.05, egg: 0.05, pancreas_green_tripe: 0.05 }
};

let currentSpecies = 'dog';

/* --- INICIALIZACIÓN --- */
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    // Animación del loader
    setTimeout(() => {
        document.getElementById('loader-overlay').style.opacity = '0';
        setTimeout(() => { 
            document.getElementById('loader-overlay').classList.add('hidden');
            document.getElementById('main-body').classList.add('loaded');
            document.getElementById('main-body').classList.remove('overflow-hidden');
        }, 500);
    }, 2000);
    
    renderActivityOptions();
    renderDisclaimer(); // Aquí se carga la nota completa
});

/* --- LÓGICA DE INTERFAZ --- */
function toggleSpecies() {
    currentSpecies = currentSpecies === 'dog' ? 'cat' : 'dog';
    const isDog = currentSpecies === 'dog';
    document.getElementById('speciesToggle').dataset.species = currentSpecies;

    // Cambiar estilos botones
    document.getElementById('btn-dog').classList.toggle('text-white', isDog);
    document.getElementById('btn-dog').classList.toggle('text-gray-400', !isDog);
    document.getElementById('btn-cat').classList.toggle('text-white', !isDog);
    document.getElementById('btn-cat').classList.toggle('text-gray-400', isDog);
    
    // Cambiar colores generales
    document.getElementById('title-accent').className = isDog ? 'text-yellow-600' : 'text-purple-600';
    document.getElementById('result-container-border').style.borderColor = isDog ? THEME.dog.primary : THEME.cat.primary;
    
    // Cambiar botón calcular
    const btn = document.getElementById('calc-btn');
    btn.className = `w-full text-white text-xl font-bold py-4 rounded-2xl btn-3d flex justify-center items-center gap-2 ${isDog ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-purple-600 hover:bg-purple-500'}`;
    
    // Mostrar/Ocultar inputs de gato
    document.getElementById('cat-specific-inputs').classList.toggle('hidden', isDog);
    
    // Meta color móvil
    document.querySelector('meta[name="theme-color"]').setAttribute("content", isDog ? "#FFA000" : "#9C27B0");
    
    // Resetear resultados
    document.getElementById('results-section').classList.add('hidden');
    renderActivityOptions();
}

function renderActivityOptions() {
    const container = document.getElementById('activity-options');
    container.innerHTML = '';
    const data = currentSpecies === 'dog' ? DOG_CONSTANTS.ACT : CAT_CONSTANTS.ACT;
    const color = currentSpecies === 'dog' ? 'orange' : 'purple';
    
    Object.entries(data).forEach(([key, info], idx) => {
        container.innerHTML += `
            <label class="cursor-pointer relative">
                <input type="radio" name="activity" value="${key}" class="peer sr-only" ${idx === 1 ? 'checked' : ''}>
                <div class="activity-card p-4 rounded-2xl bg-gray-50 text-center h-full text-gray-400 peer-checked:text-${color}-600 peer-checked:bg-${color}-50 peer-checked:border-${color}-200">
                    <i data-lucide="${info.icon}" class="w-8 h-8 mx-auto mb-2 opacity-80"></i>
                    <span class="block font-bold text-sm">${info.label}</span>
                </div>
            </label>`;
    });
    lucide.createIcons();
}

/* --- LÓGICA DE CÁLCULO --- */
function handleCalculate(e) {
    e.preventDefault();
    const w = parseFloat(document.getElementById('weight').value);
    const tw = parseFloat(document.getElementById('targetWeight').value) || w;
    const act = document.querySelector('input[name="activity"]:checked').value;

    let total, comps, mer, taurineOK = true, taurine = 0;

    if (currentSpecies === 'dog') {
        // Cálculo Perro
        const rer = 70 * Math.pow(w, 0.75);
        mer = (70 * Math.pow(tw, 0.75)) * DOG_CONSTANTS.ACT[act].val;
        total = mer / DOG_CONSTANTS.DENSITY;
        comps = {};
        for (let [k, v] of Object.entries(DOG_CONSTANTS.DIET)) comps[k] = total * v;
        document.getElementById('cat-alert-box').classList.add('hidden');
    } else {
        // Cálculo Gato
        const neutered = document.getElementById('isNeutered').checked;
        const baseRer = 40 * Math.pow(tw, 0.75);
        mer = baseRer * (neutered ? 0.9 : 1.0) * CAT_CONSTANTS.ACT[act].val;
        total = mer / CAT_CONSTANTS.DENSITY;
        comps = {};
        for (let [k, v] of Object.entries(CAT_CONSTANTS.DIET)) comps[k] = total * v;
        
        // Taurina
        taurine = (comps.heart * 1.5) + (comps.liver * 0.6);
        taurineOK = taurine >= 50;
        
        document.getElementById('cat-alert-box').classList.remove('hidden');
        document.getElementById('taurine-msg').innerHTML = taurineOK 
            ? `<span class="text-green-600 font-bold">¡Buen nivel! (~${Math.round(taurine)}mg)</span>` 
            : `<span class="text-red-600 font-bold">Bajo. Necesitas suplementar.</span>`;
    }

    // Renderizar Resultados
    document.getElementById('total-daily').innerText = Math.round(total) + 'g';
    document.getElementById('val-mer').innerText = Math.round(mer);

    const list = document.getElementById('ingredients-list');
    list.innerHTML = '';
    
    const labels = { 
        lean_meat: "Carne Magra", 
        bony_parts: "Huesos Carnosos", 
        liver: "Hígado", 
        other_organs: "Otras Vísceras", 
        heart: "Corazón (Taurina)", 
        whole_fish: "Pescado", 
        vegetables: "Verduras / Fruta", 
        egg: "Huevito", 
        pancreas_green_tripe: "Panza Verde" 
    };
    
    const colorClass = currentSpecies === 'dog' ? 'bg-orange-400' : 'bg-purple-400';

    for (let [k, v] of Object.entries(comps)) {
        if (Math.round(v) <= 0) continue;
        list.innerHTML += `
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <span class="font-black text-lg">${labels[k][0]}</span>
            </div>
            <div class="flex-1">
                <div class="flex justify-between mb-1">
                    <span class="font-bold text-gray-700">${labels[k]}</span>
                    <span class="font-bold text-gray-900">${Math.round(v)}g</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${colorClass}" style="width:${(v / total) * 100}%"></div>
                </div>
            </div>
        </div>`;
    }
    
    const rSec = document.getElementById('results-section');
    rSec.classList.remove('hidden');
    rSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --- RENDERIZADO DE NOTAS (AQUÍ ESTÁ EL CAMBIO) --- */
function renderDisclaimer() {
    document.getElementById('disclaimer-container').innerHTML = `
        <div class="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <h3 class="font-bold text-yellow-800 flex items-center gap-2 mb-3">
                <i data-lucide="info" class="w-5 h-5"></i> Nota Importante
            </h3>
            <p class="text-yellow-900 mb-2">Esta calculadora ayuda a estimar porciones iniciales, pero cada mascota es un mundo.</p>
            <ul class="list-disc list-inside text-yellow-800 space-y-1 ml-1 text-sm">
                <li>Es vital añadir <strong>suplementos</strong> (Yodo, Vitamina E, Omega 3, etc).</li>
                <li>Los <strong>gatos necesitan Taurina</strong> obligatoriamente en su dieta.</li>
                <li>Los porcentajes pueden variar según la edad y estado de salud.</li>
                <li><strong>Consulta siempre con tu veterinario/nutricionista</strong> antes de cambiar la dieta.</li>
            </ul>
        </div>
    `;
    lucide.createIcons();
}
