
const es6_config = {

  input   : 'build/es6/circular_buffer.js',

  output  : {
    file   : 'build/circular_buffer.esm.js',
    format : 'es',
    name   : 'circular_buffer'
  }

};





const cjs_config = {

  input   : 'build/es6/circular_buffer.js',

  output  : {
    file   : 'build/circular_buffer.cjs.js',
    format : 'cjs',
    name   : 'circular_buffer'
  }

};





const iife_config = {

  input   : 'build/es6/circular_buffer.js',

  output  : {
    file   : 'build/circular_buffer.iife.js',
    format : 'iife',
    name   : 'circular_buffer'
  }

};





export default [ es6_config, cjs_config, iife_config ];
