import { join } from 'path';
import { assign } from './utils.js';
import { transform } from 'babel-core';
import { INLINE, RUNTIME, BUNDLED } from './constants.js';
import classes from 'babel-plugin-transform-es2015-classes';

let preflightCheckResults = {};

export default function preflightCheck ( options, dir ) {
	if ( !preflightCheckResults[ dir ] ) {
		let helpers;

		options = assign( {}, options );
		delete options.only;
		options.filename = join( dir, 'x.js' );

		options.plugins = options.plugins ? options.plugins.concat( classes ) : [ classes ];

		const check = transform( 'export default class Foo {}', options ).code;

		if ( !~check.indexOf( 'export default' ) && !~check.indexOf( 'export { Foo as default }' ) ) throw new Error( 'It looks like your Babel configuration specifies a module transformer. Please disable it. See https://github.com/rollup/rollup-plugin-babel#configuring-babel for more information' );

		if ( ~check.indexOf( 'import _classCallCheck from "babel-runtime' ) ) helpers = RUNTIME;
		else if ( ~check.indexOf( 'function _classCallCheck' ) ) helpers = INLINE;
		else if ( ~check.indexOf( 'babelHelpers' ) ) helpers = BUNDLED;

		else {
			throw new Error( 'An unexpected situation arose. Please raise an issue at https://github.com/rollup/rollup-plugin-babel/issues. Thanks!' );
		}

		preflightCheckResults[ dir ] = helpers;
	}

	return preflightCheckResults[ dir ];
}
