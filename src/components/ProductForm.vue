<template>
  <form class="form tarjeta" novalidate @submit.prevent="enviar">
    <div class="form__grid">
      <!-- Nombre -->
      <div class="campo campo--ancho">
        <label for="f-nombre">Nombre del producto *</label>
        <input id="f-nombre" v-model.trim="form.nombre" type="text" maxlength="80" placeholder="NVIDIA GeForce RTX 3060 12GB" :aria-invalid="!!errores.nombre" aria-describedby="e-nombre" @blur="validarCampo('nombre')">
        <p v-if="errores.nombre" id="e-nombre" class="campo__error">{{ errores.nombre }}</p>
      </div>

      <!-- SKU -->
      <div class="campo">
        <label for="f-sku">SKU * <span class="campo__ayuda">Formato: MT-0000</span></label>
        <input id="f-sku" v-model.trim="form.sku" type="text" maxlength="7" placeholder="MT-0017" :aria-invalid="!!errores.sku" aria-describedby="e-sku" @blur="validarCampo('sku')" @input="form.sku = form.sku.toUpperCase()">
        <p v-if="errores.sku" id="e-sku" class="campo__error">{{ errores.sku }}</p>
      </div>

      <!-- Marca -->
      <div class="campo">
        <label for="f-marca">Marca *</label>
        <input id="f-marca" v-model.trim="form.marca" type="text" maxlength="40" :aria-invalid="!!errores.marca" aria-describedby="e-marca" @blur="validarCampo('marca')">
        <p v-if="errores.marca" id="e-marca" class="campo__error">{{ errores.marca }}</p>
      </div>

      <!-- Categoría -->
      <div class="campo">
        <label for="f-categoria">Categoría *</label>
        <select id="f-categoria" v-model="form.categoria" :aria-invalid="!!errores.categoria" aria-describedby="e-categoria" @change="validarCampo('categoria')">
          <option value="" disabled>Elegí una categoría</option>
          <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
        </select>
        <p v-if="errores.categoria" id="e-categoria" class="campo__error">{{ errores.categoria }}</p>
      </div>

      <!-- Condición -->
      <div class="campo">
        <label for="f-condicion">Condición *</label>
        <select id="f-condicion" v-model="form.condicion" :aria-invalid="!!errores.condicion" aria-describedby="e-condicion" @change="validarCampo('condicion')">
          <option value="" disabled>Elegí la condición</option>
          <option v-for="c in condiciones" :key="c" :value="c">{{ c }}</option>
        </select>
        <p v-if="errores.condicion" id="e-condicion" class="campo__error">{{ errores.condicion }}</p>
      </div>

      <!-- Precio -->
      <div class="campo">
        <label for="f-precio">Precio en pesos *</label>
        <div class="campo__prefijo">
          <span aria-hidden="true">$</span>
          <input id="f-precio" v-model="form.precio" type="text" inputmode="numeric" placeholder="320000" :aria-invalid="!!errores.precio" aria-describedby="e-precio" @blur="validarCampo('precio')">
        </div>
        <p v-if="errores.precio" id="e-precio" class="campo__error">{{ errores.precio }}</p>
      </div>

      <!-- Stock -->
      <div class="campo">
        <label for="f-stock">Stock (unidades) *</label>
        <input id="f-stock" v-model="form.stock" type="text" inputmode="numeric" placeholder="1" :aria-invalid="!!errores.stock" aria-describedby="e-stock" @blur="validarCampo('stock')">
        <p v-if="errores.stock" id="e-stock" class="campo__error">{{ errores.stock }}</p>
      </div>

      <!-- Especificaciones -->
      <div class="campo campo--ancho">
        <label for="f-specs">Especificaciones <span class="campo__ayuda">Opcional · ej: 12 GB GDDR6 · 192-bit</span></label>
        <input id="f-specs" v-model.trim="form.specs" type="text" maxlength="80" :aria-invalid="!!errores.specs" aria-describedby="e-specs" @blur="validarCampo('specs')">
        <p v-if="errores.specs" id="e-specs" class="campo__error">{{ errores.specs }}</p>
      </div>

      <!-- Foto -->
      <fieldset class="campo campo--ancho foto">
        <legend>Foto del producto *</legend>
        <div class="foto__fila">
          <div class="foto__preview">
            <img v-if="vistaPrevia" :src="vistaPrevia" alt="Vista previa de la foto">
            <span v-else>Sin foto</span>
          </div>
          <div class="foto__opciones">
            <label class="btn btn--secundario btn--chico foto__subir" for="f-archivo">
              {{ subiendo ? 'Procesando…' : 'Subir foto desde la compu' }}
            </label>
            <input id="f-archivo" ref="archivo" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" @change="subirFoto">
            <span class="campo__ayuda">JPG, PNG o WEBP de hasta 5 MB. Se achica sola.</span>
            <label for="f-imagen" class="foto__o">o pegá un link</label>
            <input id="f-imagen" v-model.trim="urlImagen" type="url" placeholder="https://…/foto.jpg" :aria-invalid="!!errores.imagen" aria-describedby="e-imagen" @blur="usarUrl">
            <button v-if="form.imagen" type="button" class="foto__quitar" @click="quitarFoto">Quitar foto</button>
          </div>
        </div>
        <p v-if="errores.imagen" id="e-imagen" class="campo__error">{{ errores.imagen }}</p>
      </fieldset>

      <!-- Descripción -->
      <div class="campo campo--ancho">
        <label for="f-desc">Descripción * <span class="campo__ayuda">{{ form.descripcion.length }}/300 · mínimo 20 caracteres</span></label>
        <textarea id="f-desc" v-model.trim="form.descripcion" rows="4" maxlength="300" :aria-invalid="!!errores.descripcion" aria-describedby="e-desc" @blur="validarCampo('descripcion')"></textarea>
        <p v-if="errores.descripcion" id="e-desc" class="campo__error">{{ errores.descripcion }}</p>
      </div>

      <!-- Ficha técnica -->
      <div class="campo campo--ancho">
        <label for="f-ficha">Ficha técnica <span class="campo__ayuda">Opcional · un dato por línea con el formato "Dato: valor" (ej: Memoria: 12 GB GDDR6)</span></label>
        <textarea id="f-ficha" v-model="form.fichaTexto" rows="5" placeholder="Chip gráfico: NVIDIA GA106&#10;Memoria: 12 GB GDDR6&#10;Fuente recomendada: 550 W" :aria-invalid="!!errores.fichaTexto" aria-describedby="e-ficha" @blur="validarCampo('fichaTexto')"></textarea>
        <p v-if="errores.fichaTexto" id="e-ficha" class="campo__error">{{ errores.fichaTexto }}</p>
      </div>

      <!-- Ideal para -->
      <div class="campo campo--ancho">
        <label for="f-ideal">Ideal para <span class="campo__ayuda">Opcional · un uso por línea (máximo 5)</span></label>
        <textarea id="f-ideal" v-model="form.idealTexto" rows="3" placeholder="Gaming en 1080p&#10;Edición de video" :aria-invalid="!!errores.idealTexto" aria-describedby="e-ideal" @blur="validarCampo('idealTexto')"></textarea>
        <p v-if="errores.idealTexto" id="e-ideal" class="campo__error">{{ errores.idealTexto }}</p>
      </div>

      <!-- Destacado -->
      <label class="check campo--ancho">
        <input v-model="form.destacado" type="checkbox">
        <span>Mostrar como destacado en el inicio</span>
      </label>
    </div>

    <transition name="aviso">
      <p v-if="(hayErrores && intentoEnviar) || errorGeneral" class="form__resumen" role="alert">
        {{ errorGeneral || `Revisá ${cantidadErrores} ${cantidadErrores === 1 ? 'campo marcado' : 'campos marcados'} antes de guardar.` }}
      </p>
    </transition>

    <div class="form__acciones">
      <!-- mousedown.prevent: evita que el blur del último campo mueva el botón antes del clic -->
      <button type="button" class="btn btn--fantasma" @mousedown.prevent @click="$emit('cancelar')">Cancelar</button>
      <button type="submit" class="btn btn--primario" :disabled="subiendo" @mousedown.prevent>{{ modo === 'edicion' ? 'Guardar cambios' : 'Publicar producto' }}</button>
    </div>
  </form>
</template>

<script>
import { CATEGORIAS, CONDICIONES } from '../data/productosIniciales'
import { skuDisponible } from '../services/productosService'
import { resolverImagen, prepararFotoSubida } from '../services/imagenes'

const VACIO = {
  nombre: '',
  sku: '',
  marca: '',
  categoria: '',
  condicion: '',
  precio: '',
  stock: '',
  specs: '',
  imagen: '',
  descripcion: '',
  fichaTexto: '',
  idealTexto: '',
  destacado: false
}

// Convierte el texto "Dato: valor" (una línea por dato) en una lista de pares.
function textoAFicha (texto) {
  return texto.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf(':')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  })
}

export default {
  name: 'ProductForm',
  props: {
    // Producto a editar (en modo alta llega null).
    productoInicial: { type: Object, default: null },
    modo: { type: String, default: 'alta', validator: (v) => ['alta', 'edicion'].includes(v) },
    // Mensaje de error que puede mandar la vista (por ejemplo, LocalStorage lleno).
    errorGeneral: { type: String, default: '' }
  },
  emits: ['guardar', 'cancelar'],
  data () {
    return {
      categorias: CATEGORIAS,
      condiciones: CONDICIONES,
      form: { ...VACIO },
      urlImagen: '',
      errores: {},
      intentoEnviar: false,
      subiendo: false
    }
  },
  computed: {
    cantidadErrores () {
      return Object.values(this.errores).filter(Boolean).length
    },
    hayErrores () {
      return this.cantidadErrores > 0
    },
    vistaPrevia () {
      return resolverImagen(this.form.imagen)
    }
  },
  created () {
    // Si estamos editando, precargamos el formulario con una copia del producto.
    if (this.productoInicial) {
      this.form = {
        ...VACIO,
        ...this.productoInicial,
        precio: String(this.productoInicial.precio),
        stock: String(this.productoInicial.stock),
        fichaTexto: (this.productoInicial.ficha || []).map(([d, v]) => `${d}: ${v}`).join('\n'),
        idealTexto: (this.productoInicial.ideal || []).join('\n')
      }
      if (/^https?:/.test(this.form.imagen)) this.urlImagen = this.form.imagen
    }
  },
  methods: {
    // Validaciones personalizadas: devuelve el mensaje de error o '' si el campo es válido.
    reglas (campo) {
      const v = this.form[campo]
      switch (campo) {
        case 'nombre':
          if (!v) return 'El nombre es obligatorio.'
          if (v.length < 5) return 'El nombre debe tener al menos 5 caracteres.'
          return ''
        case 'sku':
          if (!v) return 'El SKU es obligatorio.'
          if (!/^[A-Z]{2}-\d{4}$/.test(v)) return 'Formato inválido. Usá 2 letras, un guion y 4 números (ej: MT-0017).'
          if (!skuDisponible(v, this.productoInicial ? this.productoInicial.id : null)) return 'Ese SKU ya lo usa otro producto.'
          return ''
        case 'marca':
          if (!v) return 'La marca es obligatoria.'
          if (v.length < 2) return 'La marca debe tener al menos 2 caracteres.'
          return ''
        case 'categoria':
          return v ? '' : 'Elegí una categoría.'
        case 'condicion':
          return v ? '' : 'Elegí si es nuevo, usado o reacondicionado.'
        case 'precio': {
          const texto = String(v).replace(/[.\s$]/g, '')
          if (!texto) return 'El precio es obligatorio.'
          if (!/^\d+$/.test(texto)) return 'Escribí el precio en pesos, solo números y sin centavos (ej: 320000).'
          if (Number(texto) < 1000) return 'El precio mínimo es $1.000.'
          if (Number(texto) > 50000000) return 'El precio no puede superar $50.000.000.'
          return ''
        }
        case 'stock':
          if (v === '' || v === null) return 'El stock es obligatorio.'
          if (!/^\d+$/.test(String(v))) return 'El stock debe ser un número entero (0 si no hay unidades).'
          if (Number(v) > 999) return 'El stock máximo es 999.'
          return ''
        case 'specs':
          if (v && v.length < 4) return 'Si cargás especificaciones, que tengan al menos 4 caracteres.'
          return ''
        case 'imagen':
          if (!v) return 'Subí una foto o pegá el link de una.'
          return ''
        case 'fichaTexto': {
          const lineas = v.split('\n').map((l) => l.trim()).filter(Boolean)
          const mal = lineas.findIndex((l) => { const i = l.indexOf(':'); return i < 1 || !l.slice(i + 1).trim() })
          if (mal >= 0) return `La línea ${mal + 1} no tiene el formato "Dato: valor".`
          if (lineas.length > 20) return 'Cargá como máximo 20 datos.'
          return ''
        }
        case 'idealTexto': {
          const lineas = v.split('\n').map((l) => l.trim()).filter(Boolean)
          if (lineas.length > 5) return 'Cargá como máximo 5 usos.'
          if (lineas.some((l) => l.length < 4)) return 'Cada uso tiene que tener al menos 4 caracteres.'
          return ''
        }
        case 'descripcion':
          if (!v) return 'La descripción es obligatoria.'
          if (v.length < 20) return `La descripción debe tener al menos 20 caracteres (faltan ${20 - v.length}).`
          return ''
        default:
          return ''
      }
    },
    validarCampo (campo) {
      this.errores = { ...this.errores, [campo]: this.reglas(campo) }
    },
    validarTodo () {
      Object.keys(VACIO).filter((c) => c !== 'destacado').forEach((c) => this.validarCampo(c))
      return !this.hayErrores
    },
    async subirFoto (e) {
      const archivo = e.target.files[0]
      e.target.value = ''
      if (!archivo) return
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(archivo.type)) {
        this.errores = { ...this.errores, imagen: 'Formato no permitido. Usá JPG, PNG o WEBP.' }
        return
      }
      if (archivo.size > 5 * 1024 * 1024) {
        this.errores = { ...this.errores, imagen: 'La foto pesa más de 5 MB. Elegí una más liviana.' }
        return
      }
      this.subiendo = true
      try {
        this.form.imagen = await prepararFotoSubida(archivo)
        this.urlImagen = ''
        this.validarCampo('imagen')
      } catch (err) {
        this.errores = { ...this.errores, imagen: err.message }
      } finally {
        this.subiendo = false
      }
    },
    usarUrl () {
      if (!this.urlImagen) return
      if (!/^https:\/\/\S+\.(jpg|jpeg|png|webp)(\?\S*)?$/i.test(this.urlImagen)) {
        this.errores = { ...this.errores, imagen: 'El link debe empezar con https:// y terminar en .jpg, .png o .webp.' }
        return
      }
      this.form.imagen = this.urlImagen
      this.validarCampo('imagen')
    },
    quitarFoto () {
      this.form.imagen = ''
      this.urlImagen = ''
    },
    enviar () {
      this.intentoEnviar = true
      if (!this.validarTodo()) {
        this.$nextTick(() => {
          const primero = this.$el.querySelector('[aria-invalid="true"]')
          if (primero) primero.focus()
        })
        return
      }
      this.$emit('guardar', {
        nombre: this.form.nombre,
        sku: this.form.sku,
        marca: this.form.marca,
        categoria: this.form.categoria,
        condicion: this.form.condicion,
        precio: Number(String(this.form.precio).replace(/[.\s$]/g, '')),
        stock: Number(this.form.stock),
        specs: this.form.specs,
        imagen: this.form.imagen,
        descripcion: this.form.descripcion,
        ficha: textoAFicha(this.form.fichaTexto),
        ideal: this.form.idealTexto.split('\n').map((l) => l.trim()).filter(Boolean),
        destacado: this.form.destacado
      })
    }
  }
}
</script>

<style scoped>
.form { padding: 20px; }
.form__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; }
.campo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.campo label,
.campo legend { font-size: 14px; font-weight: 600; }
.campo__ayuda { display: block; font-weight: 400; font-size: 12px; color: var(--texto-2); margin-top: 2px; }
input[type="text"],
input[type="url"],
select,
textarea {
  width: 100%;
  font: inherit;
  font-size: 16px;
  color: var(--texto);
  min-height: 48px;
  padding: 10px 14px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--fondo);
  transition: border-color 0.15s ease, background 0.15s ease;
}
textarea { resize: vertical; line-height: 1.5; }
input:focus,
select:focus,
textarea:focus { border-color: var(--navy); background: var(--papel); outline: none; box-shadow: 0 0 0 3px rgba(214, 51, 132, 0.25); }
[aria-invalid="true"] { border-color: var(--error); background: #fff5f4; }
.campo__prefijo { position: relative; }
.campo__prefijo span { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--texto-2); }
.campo__prefijo input { padding-left: 28px; }
.campo__error { margin: 0; font-size: 13px; color: var(--error); }
.campo__error::before { content: '⚠ '; }

.foto { border: 0; padding: 0; margin: 0; }
.foto legend { padding: 0; margin-bottom: 6px; }
.foto__fila { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.foto__preview {
  width: 160px;
  aspect-ratio: 4 / 3;
  border: 1px dashed #cfc6c8;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--texto-2);
  font-size: 13px;
}
.foto__preview img { width: 100%; height: 100%; object-fit: cover; }
.foto__opciones { flex: 1 1 240px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.foto__subir { align-self: flex-start; cursor: pointer; }
.foto__o { font-size: 13px; color: var(--texto-2); margin-top: 6px; }
.foto__quitar {
  align-self: flex-start;
  border: 0;
  background: none;
  padding: 6px 0;
  font: inherit;
  font-size: 14px;
  color: var(--error);
  text-decoration: underline;
  cursor: pointer;
}

.check { display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 15px; cursor: pointer; }
.check input { width: 20px; height: 20px; accent-color: var(--magenta); }
.form__resumen {
  margin: 20px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fdecea;
  color: var(--error);
  font-size: 14px;
  font-weight: 500;
}
.form__acciones { display: flex; flex-direction: column-reverse; gap: 10px; margin-top: 24px; }
.aviso-enter-active,
.aviso-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.aviso-enter-from,
.aviso-leave-to { opacity: 0; transform: translateY(-6px); }

@media (min-width: 640px) {
  .form { padding: 32px; }
  .form__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .campo--ancho { grid-column: 1 / -1; }
  .form__acciones { flex-direction: row; justify-content: flex-end; }
}
</style>
