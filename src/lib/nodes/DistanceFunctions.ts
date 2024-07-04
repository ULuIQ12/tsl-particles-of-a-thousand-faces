// @ts-nocheck
import { abs, clamp, cond, dot, float, If, int, length, max, min, mul, sign, sqrt, tslFn, vec2, vec3, vec4 } from "three/examples/jsm/nodes/Nodes.js";

// Inigo Quilez functions put through the transpiler
// https://iquilezles.org/articles/distfunctions/
// https://iquilezles.org/articles/distfunctions2d/
// https://threejs.org/examples/?q=webgpu#webgpu_tsl_transpiler

// 3D functions ////////////////////////////////////////////////////////////////////////////
const sdSphere = tslFn( ( [ p_immutable, s_immutable ] ) => {

    const s = float( s_immutable ).toVar();
    const p = vec3( p_immutable ).toVar();
    return length( p ).sub( s );
}).setLayout( {
    name: 'sdSphere',
    type: 'float',
    inputs: [
        { name: 'p', type: 'vec3' },
        { name: 's', type: 'float' }
    ]
} );

const sdHollowSphere = tslFn( ( [ p_immutable, s_immutable, t_immutable ] ) => {
    
        const s = float( s_immutable ).toVar();
        const t = float( t_immutable ).toVar();
        const p = vec3( p_immutable ).toVar();
        return abs( length( p ).sub( s ) ).sub( t );
}).setLayout( {
    name: 'sdHollowSphere',
    type: 'float',
    inputs: [
        { name: 'p', type: 'vec3' },
        { name: 's', type: 'float' },
        { name: 't', type: 'float' }
    ]
} );


const sdTorus = tslFn( ( [ p_immutable, t_immutable ] ) => {

    const t = vec2( t_immutable ).toVar();
    const p = vec3( p_immutable ).toVar();
    const q = vec2( length( p.xz ).sub( t.x ), p.y ).toVar();
    return length( q ).sub( t.y );
}).setLayout( {
	name: 'sdTorus',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec3' },
		{ name: 't', type: 'vec2' }
	]
} );

// a slight change to the scaling from the original
const sdPyramid = tslFn( ( [ p_immutable, h_immutable, sc_immutable ] ) => {

	const h = float( h_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
    const sc = float( sc_immutable ).toVar();
    p.mulAssign( sc );
	const m2 = float( h.mul( h ).add( 0.25 ) ).toVar();
	p.xz.assign( abs( p.xz ) );
	p.xz.assign( cond( p.z.greaterThan( p.x ), p.zx, p.xz ) );
	p.xz.subAssign( 0.5 );
	const q = vec3( p.z, h.mul( p.y ).sub( mul( 0.5, p.x ) ), h.mul( p.x ).add( mul( 0.5, p.y ) ) ).toVar();
	const s = float( max( q.x.negate(), 0.0 ) ).toVar();
	const t = float( clamp( q.y.sub( mul( 0.5, p.z ) ).div( m2.add( 0.25 ) ), 0.0, 1.0 ) ).toVar();
	const a = float( m2.mul( q.x.add( s ).mul( q.x.add( s ) ) ).add( q.y.mul( q.y ) ) ).toVar();
	const b = float( m2.mul( q.x.add( mul( 0.5, t ) ).mul( q.x.add( mul( 0.5, t ) ) ) ).add( q.y.sub( m2.mul( t ) ).mul( q.y.sub( m2.mul( t ) ) ) ) ).toVar();
	const d2 = float( cond( min( q.y, q.x.negate().mul( m2 ).sub( q.y.mul( 0.5 ) ) ).greaterThan( 0.0 ), 0.0, min( a, b ) ) ).toVar();

	return sqrt( d2.add( q.z.mul( q.z ) ).div( m2 ) ).mul( sign( max( q.z, p.y.negate() ) ) );

} ).setLayout( {
    name: 'sdPyramid',
    type: 'float',
    inputs: [
        { name: 'p', type: 'vec3' },
        { name: 'h', type: 'float' },
        { name: 'sc', type: 'float' }
    ]
} );

const sdBoxFrame = tslFn( ( [ p_immutable, b_immutable, e_immutable ] ) => {

	const e = float( e_immutable ).toVar();
	const b = vec3( b_immutable ).toVar();
	const p = vec3( p_immutable ).toVar();
	p.assign( abs( p ).sub( b ) );
	const q = vec3( abs( p.add( e ) ).sub( e ) ).toVar();

	return min( min( length( max( vec3( p.x, q.y, q.z ), 0.0 ) ).add( min( max( p.x, max( q.y, q.z ) ), 0.0 ) ), length( max( vec3( q.x, p.y, q.z ), 0.0 ) ).add( min( max( q.x, max( p.y, q.z ) ), 0.0 ) ) ), length( max( vec3( q.x, q.y, p.z ), 0.0 ) ).add( min( max( q.x, max( q.y, p.z ) ), 0.0 ) ) );

} ).setLayout( {
    name: 'sdBoxFrame',
    type: 'float',
    inputs: [
        { name: 'p', type: 'vec3' },
        { name: 'b', type: 'vec3' },
        { name: 'e', type: 'float' }
    ]
} );

/////// 2D functions ////////////////////////////////////////////////////////////////////////////
const sdBox = tslFn( ( [ p_immutable, b_immutable ] ) => {

	const b = vec2( b_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const d = vec2( abs( p ).sub( b ) ).toVar();

	return length( max( d, 0.0 ) ).add( min( max( d.x, d.y ), 0.0 ) );

} ).setLayout( {
	name: 'sdBox',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2', qualifier: 'in' },
		{ name: 'b', type: 'vec2', qualifier: 'in' }
	]
} );

export const sdRoundedBox = /*#__PURE__*/ tslFn( ( [ p_immutable, b_immutable, r_immutable ] ) => {

	const r = vec4( r_immutable ).toVar();
	const b = vec2( b_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	r.xy.assign( cond( p.x.greaterThan( 0.0 ), r.xy, r.zw ) );
	r.x.assign( cond( p.y.greaterThan( 0.0 ), r.x, r.y ) );
	const q = vec2( abs( p ).sub( b ).add( r.x ) ).toVar();

	return min( max( q.x, q.y ), 0.0 ).add( length( max( q, 0.0 ) ).sub( r.x ) );

} ).setLayout( {
	name: 'sdRoundedBox',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2', qualifier: 'in' },
		{ name: 'b', type: 'vec2', qualifier: 'in' },
		{ name: 'r', type: 'vec4', qualifier: 'in' }
	]
} );

const sdCircle = tslFn( ( [ p_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	return length( p ).sub( r );

} ).setLayout( {
	name: 'sdCircle',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'r', type: 'float' }
	]
} );

const sdRoundedX = tslFn( ( [ p_immutable, w_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const w = float( w_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	p.assign( abs( p ) );

	return length( p.sub( min( p.x.add( p.y ), w ).mul( 0.5 ) ) ).sub( r );

} ).setLayout( {
	name: 'sdRoundedX',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2', qualifier: 'in' },
		{ name: 'w', type: 'float', qualifier: 'in' },
		{ name: 'r', type: 'float', qualifier: 'in' }
	]
} );

const sdHexagon = tslFn( ( [ p_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	const k = vec3( - 0.866025404, 0.5, 0.577350269 );
	p.assign( abs( p ) );
	p.subAssign( mul( 2.0, min( dot( k.xy, p ), 0.0 ).mul( k.xy ) ) );
	p.subAssign( vec2( clamp( p.x, k.z.negate().mul( r ), k.z.mul( r ) ), r ) );

	return length( p ).mul( sign( p.y ) );

} ).setLayout( {
	name: 'sdHexagon',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2', qualifier: 'in' },
		{ name: 'r', type: 'float', qualifier: 'in' }
	]
} );

const sdCross = /*#__PURE__*/ tslFn( ( [ p_immutable, b_immutable, r_immutable ] ) => {

	const r = float( r_immutable ).toVar();
	const b = vec2( b_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	p.assign( abs( p ) );
	p.assign( cond( p.y.greaterThan( p.x ), p.yx, p.xy ) );
	const q = vec2( p.sub( b ) ).toVar();
	const k = float( max( q.y, q.x ) ).toVar();
	const w = vec2( cond( k.greaterThan( 0.0 ), q, vec2( b.y.sub( p.x ), k.negate() ) ) ).toVar();

	return sign( k ).mul( length( max( w, 0.0 ) ) ).add( r );

} ).setLayout( {
	name: 'sdCross',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2', qualifier: 'in' },
		{ name: 'b', type: 'vec2', qualifier: 'in' },
		{ name: 'r', type: 'float' }
	]
} );

const sdMoon = /*#__PURE__*/ tslFn( ( [ p_immutable, d_immutable, ra_immutable, rb_immutable ] ) => {

	const rb = float( rb_immutable ).toVar();
	const ra = float( ra_immutable ).toVar();
	const d = float( d_immutable ).toVar();
	const p = vec2( p_immutable ).toVar();
	p.y.assign( abs( p.y ) );
	const a = float( ra.mul( ra ).sub( rb.mul( rb ) ).add( d.mul( d ) ).div( mul( 2.0, d ) ) ).toVar();
	const b = float( sqrt( max( ra.mul( ra ).sub( a.mul( a ) ), 0.0 ) ) ).toVar();

	If( d.mul( p.x.mul( b ).sub( p.y.mul( a ) ) ).greaterThan( d.mul( d ).mul( max( b.sub( p.y ), 0.0 ) ) ), () => {

		return length( p.sub( vec2( a, b ) ) );

	} );

	return max( length( p ).sub( ra ), length( p.sub( vec2( d, int( 0 ) ) ) ).sub( rb ).negate() );

} ).setLayout( {
	name: 'sdMoon',
	type: 'float',
	inputs: [
		{ name: 'p', type: 'vec2' },
		{ name: 'd', type: 'float' },
		{ name: 'ra', type: 'float' },
		{ name: 'rb', type: 'float' }
	]
} );

export { sdTorus, sdSphere, sdPyramid, sdBoxFrame, sdHollowSphere};
export { sdCircle, sdBox, sdRoundedX, sdHexagon, sdCross, sdMoon }