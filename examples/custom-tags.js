/*  ------------------------------------------------------------------------ */

// NB: these packages are part of Ololog, no need to install them separately

const bullet = require ('string.bullet')
const { cyan, yellow, red, dim } = require ('ansicolor')

/*  ------------------------------------------------------------------------ */

const log = require ('ololog').configure ({

    locate: false,
    time: true,
    tag: (lines, {
            level = '',
            levelColor = { 'info': cyan, 'warn': yellow, 'error': red.bright.inverse },
            clusterId
          }) => {
        
        const clusterStr = clusterId ? ('CLUSTER[' + (clusterId + '').padStart (2, '0') + ']') : ''
        const levelStr = level && (levelColor[level] || (s => s)) (level.toUpperCase ())

        return bullet (dim (clusterStr.padStart (10)) + '\t' + levelStr.padStart (6) + '\t', lines)
    }
})

/*  ------------------------------------------------------------------------ */

log.configure ({ tag: { clusterId: 1  } })       ('foo')
log.configure ({ tag: { clusterId: 3  } }).info  ('bar')
log.configure ({ tag: { clusterId: 27 } }).error ('a multiline\nerror\nmessage')

/*  ------------------------------------------------------------------------ */
