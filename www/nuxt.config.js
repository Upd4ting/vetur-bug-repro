export default {
  /*
   ** Nuxt rendering mode
   */
  mode: 'universal',
  /*
   ** Router of the project
   */
  router: {
    base: '/',
    middleware: [],
    trailingSlash: true,
  },
  /*
   ** Nuxt target
   */
  target: 'server',
  /*
   ** Headers of the page
   */
  head: {
    title: 'vetur-bug-repro',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'img/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Major+Mono+Display&display=swap',
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#0092d9' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Auto import components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/color-mode',
  ],
  /*
   ** colorMode Config
   */
  colorMode: {
    preference: 'dark',
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    'bootstrap-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxt/content',
    [
      'nuxt-fontawesome',
      {
        imports: [
          {
            set: '@fortawesome/free-solid-svg-icons',
            icons: ['fas'],
          },
          {
            set: '@fortawesome/free-brands-svg-icons',
            icons: ['fab'],
          },
          {
            set: '@fortawesome/free-regular-svg-icons',
            icons: ['far'],
          },
        ],
      },
    ],
  ],
  bootstrapVue: {
    bootstrapCSS: false,
    bootstrapVueCSS: false,
    components: [
      'BContainer',
      'BRow',
      'BCol',
      'BButton',
      'BCollapse',
      'BImg',
      'BCarousel',
      'BCarouselSlide',
      'BNav',
      'BNavbar',
      'BNavbarNav',
      'BNavbarBrand',
      'BNavbarToggle',
    ],
    componentPlugins: ['LayoutPlugin'],
    directives: ['VBToggle'],
    directivePlugins: [],
  },
  /*
   ** Axios module configuration
   */
  axios: {
    credentials: true,
    headers: {
      common: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    },
  },
  /*
   ** Content module configuration
   */
  content: {},
  /*
   ** Build configuration
   */
  build: {
    html: {
      minify: {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true,
      },
    },
    transpile: [],
  },
};
