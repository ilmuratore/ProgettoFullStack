const path = require('path');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

function mountSwagger(app){
    const specPath = path.join(__dirname, '..', '..', 'openapi.yaml');
    const spec     = YAML.load(specPath);
    app.use(
        '/api/docs',
        swaggerUI.serve,
        swaggerUI.setup(spec, {
            customSiteTitle: 'LogiChain ERP - API Docs',
            swaggerOptions:{
                persistAuthorization: true
            },
        })
    );
    console.log('[swagger] UI disponibile su /api/docs');
}

module.exports = {mountSwagger};