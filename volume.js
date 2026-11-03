(()=>{var Yh=0,lc=1,Zh=2;var Dr=1,ta=2,kn=3,Qt=0,Rt=1,Bt=2,jn=0,Li=1,cc=2,hc=3,uc=4,Jh=5,di=100,$h=101,Kh=102,jh=103,Qh=104,eu=200,tu=201,nu=202,iu=203,Eo=204,wo=205,su=206,ru=207,ou=208,au=209,lu=210,cu=211,hu=212,uu=213,du=214,na=0,ia=1,sa=2,Di=3,ra=4,oa=5,aa=6,la=7,ca=0,fu=1,pu=2,Qn=0,mu=1,gu=2,_u=3,xu=4,yu=5,vu=6,ha=7;var dc=300,ki=301,zi=302,ua=303,da=304,Ur=306,To=1e3,ui=1001,Ao=1002,Vt=1003,Mu=1004;var Nr=1005;var en=1006,fa=1007;var yi=1008;var Un=1009,fc=1010,pc=1011,Ms=1012,pa=1013,vi=1014,pn=1015,Ss=1016,ma=1017,ga=1018,bs=1020,mc=35902,gc=35899,_c=1021,xc=1022,sn=1023,ds=1026,Es=1027,_a=1028,xa=1029,yc=1030,ya=1031;var va=1033,Fr=33776,Or=33777,Br=33778,kr=33779,Ma=35840,Sa=35841,ba=35842,Ea=35843,wa=36196,Ta=37492,Aa=37496,Ra=37808,Ca=37809,Ia=37810,Pa=37811,La=37812,Da=37813,Ua=37814,Na=37815,Fa=37816,Oa=37817,Ba=37818,ka=37819,za=37820,Ha=37821,Va=36492,Ga=36494,Wa=36495,Xa=36283,qa=36284,Ya=36285,Za=36286;var nr=2300,Ro=2301,bo=2302,Kl=2400,jl=2401,Ql=2402;var Su=3200,ws=3201;var Ja=0,bu=1,ei="",It="srgb",Ui="srgb-linear",ir="linear",at="srgb";var Ii=7680;var ec=519,Eu=512,wu=513,Tu=514,vc=515,Au=516,Ru=517,Cu=518,Iu=519,tc=35044,Ts=35048;var Mc="300 es",Pn=2e3,sr=2001;var Zn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ml=Math.PI/180,Co=180/Math.PI;function As(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(zt[i&255]+zt[i>>8&255]+zt[i>>16&255]+zt[i>>24&255]+"-"+zt[e&255]+zt[e>>8&255]+"-"+zt[e>>16&15|64]+zt[e>>24&255]+"-"+zt[t&63|128]+zt[t>>8&255]+"-"+zt[t>>16&255]+zt[t>>24&255]+zt[n&255]+zt[n>>8&255]+zt[n>>16&255]+zt[n>>24&255]).toLowerCase()}function et(i,e,t){return Math.max(e,Math.min(t,i))}function lf(i,e){return(i%e+e)%e}function Sl(i,e,t){return(1-t)*i+t*e}function Ws(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function jt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var be=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ot=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],f=r[o+0],p=r[o+1],_=r[o+2],y=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=_,e[t+3]=y;return}if(u!==y||l!==f||c!==p||h!==_){let m=1-a,d=l*f+c*p+h*_+u*y,E=d>=0?1:-1,x=1-d*d;if(x>Number.EPSILON){let C=Math.sqrt(x),A=Math.atan2(C,d*E);m=Math.sin(m*A)/C,a=Math.sin(a*A)/C}let g=a*E;if(l=l*m+f*g,c=c*m+p*g,h=h*m+_*g,u=u*m+y*g,m===1-a){let C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],f=r[o+1],p=r[o+2],_=r[o+3];return e[t]=a*_+h*u+l*p-c*f,e[t+1]=l*_+h*f+c*u-a*p,e[t+2]=c*_+h*p+a*f-l*u,e[t+3]=h*_-a*u-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),f=l(n/2),p=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=f*h*u+c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u-f*p*_;break;case"YXZ":this._x=f*h*u+c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u+f*p*_;break;case"ZXY":this._x=f*h*u-c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u-f*p*_;break;case"ZYX":this._x=f*h*u-c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u+f*p*_;break;case"YZX":this._x=f*h*u+c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u-f*p*_;break;case"XZY":this._x=f*h*u-c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u+f*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+a+u;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>u){let p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>u){let p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=o*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},F=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(gh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(gh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return bl.copy(this).projectOnVector(e),this.sub(bl)}reflect(e){return this.sub(bl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},bl=new F,gh=new Ot,Ye=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],_=n[8],y=s[0],m=s[3],d=s[6],E=s[1],x=s[4],g=s[7],C=s[2],A=s[5],w=s[8];return r[0]=o*y+a*E+l*C,r[3]=o*m+a*x+l*A,r[6]=o*d+a*g+l*w,r[1]=c*y+h*E+u*C,r[4]=c*m+h*x+u*A,r[7]=c*d+h*g+u*w,r[2]=f*y+p*E+_*C,r[5]=f*m+p*x+_*A,r[8]=f*d+p*g+_*w,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,f=a*l-h*r,p=c*r-o*l,_=t*u+n*f+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/_;return e[0]=u*y,e[1]=(s*c-h*n)*y,e[2]=(a*n-s*o)*y,e[3]=f*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=p*y,e[7]=(n*l-c*t)*y,e[8]=(o*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(El.makeScale(e,t)),this}rotate(e){return this.premultiply(El.makeRotation(-e)),this}translate(e,t){return this.premultiply(El.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},El=new Ye;function Sc(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function rr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Pu(){let i=rr("canvas");return i.style.display="block",i}var _h={};function fs(i){i in _h||(_h[i]=!0,console.warn(i))}function Lu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var xh=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),yh=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function cf(){let i={enabled:!0,workingColorSpace:Ui,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===at&&(s.r=Yn(s.r),s.g=Yn(s.g),s.b=Yn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===at&&(s.r=us(s.r),s.g=us(s.g),s.b=us(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ei?ir:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return fs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return fs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ui]:{primaries:e,whitePoint:n,transfer:ir,toXYZ:xh,fromXYZ:yh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:It},outputColorSpaceConfig:{drawingBufferColorSpace:It}},[It]:{primaries:e,whitePoint:n,transfer:at,toXYZ:xh,fromXYZ:yh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:It}}}),i}var nt=cf();function Yn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function us(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ji,Io=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ji===void 0&&(ji=rr("canvas")),ji.width=e.width,ji.height=e.height;let s=ji.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ji}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=rr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Yn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Yn(t[n]/255)*255):t[n]=Yn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},hf=0,ps=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:hf++}),this.uuid=As(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(wl(s[o].image)):r.push(wl(s[o]))}else r=wl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function wl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Io.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var uf=0,Tl=new F,qt=class i extends Zn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ui,s=ui,r=en,o=yi,a=sn,l=Un,c=i.DEFAULT_ANISOTROPY,h=ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:uf++}),this.uuid=As(),this.name="",this.source=new ps(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new be(0,0),this.repeat=new be(1,1),this.center=new be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Tl).x}get height(){return this.source.getSize(Tl).y}get depth(){return this.source.getSize(Tl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==dc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case To:e.x=e.x-Math.floor(e.x);break;case ui:e.x=e.x<0?0:1;break;case Ao:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case To:e.y=e.y-Math.floor(e.y);break;case ui:e.y=e.y<0?0:1;break;case Ao:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=dc;qt.DEFAULT_ANISOTROPY=1;var ot=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],_=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-y)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+y)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,g=(p+1)/2,C=(d+1)/2,A=(h+f)/4,w=(u+y)/4,P=(_+m)/4;return x>g&&x>C?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=A/n,r=w/n):g>C?g<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(g),n=A/s,r=P/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=w/r,s=P/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-_)*(m-_)+(u-y)*(u-y)+(f-h)*(f-h));return Math.abs(E)<.001&&(E=1),this.x=(m-_)/E,this.y=(u-y)/E,this.z=(f-h)/E,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Po=class extends Zn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:en,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ot(0,0,e,t),this.scissorTest=!1,this.viewport=new ot(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new qt(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:en,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ps(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Sn=class extends Po{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},or=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Vt,this.minFilter=Vt,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Lo=class extends qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Vt,this.minFilter=Vt,this.wrapR=ui,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var tn=class{constructor(e=new F(1/0,1/0,1/0),t=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Rn):Rn.fromBufferAttribute(r,o),Rn.applyMatrix4(e.matrixWorld),this.expandByPoint(Rn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Kr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Kr.copy(n.boundingBox)),Kr.applyMatrix4(e.matrixWorld),this.union(Kr)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Rn),Rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Xs),jr.subVectors(this.max,Xs),Qi.subVectors(e.a,Xs),es.subVectors(e.b,Xs),ts.subVectors(e.c,Xs),si.subVectors(es,Qi),ri.subVectors(ts,es),Ti.subVectors(Qi,ts);let t=[0,-si.z,si.y,0,-ri.z,ri.y,0,-Ti.z,Ti.y,si.z,0,-si.x,ri.z,0,-ri.x,Ti.z,0,-Ti.x,-si.y,si.x,0,-ri.y,ri.x,0,-Ti.y,Ti.x,0];return!Al(t,Qi,es,ts,jr)||(t=[1,0,0,0,1,0,0,0,1],!Al(t,Qi,es,ts,jr))?!1:(Qr.crossVectors(si,ri),t=[Qr.x,Qr.y,Qr.z],Al(t,Qi,es,ts,jr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Vn=[new F,new F,new F,new F,new F,new F,new F,new F],Rn=new F,Kr=new tn,Qi=new F,es=new F,ts=new F,si=new F,ri=new F,Ti=new F,Xs=new F,jr=new F,Qr=new F,Ai=new F;function Al(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Ai.fromArray(i,r);let a=s.x*Math.abs(Ai.x)+s.y*Math.abs(Ai.y)+s.z*Math.abs(Ai.z),l=e.dot(Ai),c=t.dot(Ai),h=n.dot(Ai);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var df=new tn,qs=new F,Rl=new F,Ln=class{constructor(e=new F,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):df.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;qs.subVectors(e,this.center);let t=qs.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(qs,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Rl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(qs.copy(e.center).add(Rl)),this.expandByPoint(qs.copy(e.center).sub(Rl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Gn=new F,Cl=new F,eo=new F,oi=new F,Il=new F,to=new F,Pl=new F,ar=class{constructor(e=new F,t=new F(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Gn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Gn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Gn.copy(this.origin).addScaledVector(this.direction,t),Gn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Cl.copy(e).add(t).multiplyScalar(.5),eo.copy(t).sub(e).normalize(),oi.copy(this.origin).sub(Cl);let r=e.distanceTo(t)*.5,o=-this.direction.dot(eo),a=oi.dot(this.direction),l=-oi.dot(eo),c=oi.lengthSq(),h=Math.abs(1-o*o),u,f,p,_;if(h>0)if(u=o*l-a,f=o*a-l,_=r*h,u>=0)if(f>=-_)if(f<=_){let y=1/h;u*=y,f*=y,p=u*(u+o*f+2*a)+f*(o*u+f+2*l)+c}else f=r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;else f<=-_?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=_?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Cl).addScaledVector(eo,f),p}intersectSphere(e,t){Gn.subVectors(e.center,this.origin);let n=Gn.dot(this.direction),s=Gn.dot(Gn)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Gn)!==null}intersectTriangle(e,t,n,s,r){Il.subVectors(t,e),to.subVectors(n,e),Pl.crossVectors(Il,to);let o=this.direction.dot(Pl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;oi.subVectors(this.origin,e);let l=a*this.direction.dot(to.crossVectors(oi,to));if(l<0)return null;let c=a*this.direction.dot(Il.cross(oi));if(c<0||l+c>o)return null;let h=-a*oi.dot(Pl);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Qe=class i{constructor(e,t,n,s,r,o,a,l,c,h,u,f,p,_,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,f,p,_,y,m)}set(e,t,n,s,r,o,a,l,c,h,u,f,p,_,y,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=_,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/ns.setFromMatrixColumn(e,0).length(),r=1/ns.setFromMatrixColumn(e,1).length(),o=1/ns.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let f=o*h,p=o*u,_=a*h,y=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+_*c,t[5]=f-y*c,t[9]=-a*l,t[2]=y-f*c,t[6]=_+p*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*h,p=l*u,_=c*h,y=c*u;t[0]=f+y*a,t[4]=_*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-_,t[6]=y+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*h,p=l*u,_=c*h,y=c*u;t[0]=f-y*a,t[4]=-o*u,t[8]=_+p*a,t[1]=p+_*a,t[5]=o*h,t[9]=y-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*h,p=o*u,_=a*h,y=a*u;t[0]=l*h,t[4]=_*c-p,t[8]=f*c+y,t[1]=l*u,t[5]=y*c+f,t[9]=p*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,p=o*c,_=a*l,y=a*c;t[0]=l*h,t[4]=y-f*u,t[8]=_*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+_,t[10]=f-y*u}else if(e.order==="XZY"){let f=o*l,p=o*c,_=a*l,y=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+y,t[5]=o*h,t[9]=p*u-_,t[2]=_*u-p,t[6]=a*h,t[10]=y*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ff,e,pf)}lookAt(e,t,n){let s=this.elements;return cn.subVectors(e,t),cn.lengthSq()===0&&(cn.z=1),cn.normalize(),ai.crossVectors(n,cn),ai.lengthSq()===0&&(Math.abs(n.z)===1?cn.x+=1e-4:cn.z+=1e-4,cn.normalize(),ai.crossVectors(n,cn)),ai.normalize(),no.crossVectors(cn,ai),s[0]=ai.x,s[4]=no.x,s[8]=cn.x,s[1]=ai.y,s[5]=no.y,s[9]=cn.y,s[2]=ai.z,s[6]=no.z,s[10]=cn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],_=n[2],y=n[6],m=n[10],d=n[14],E=n[3],x=n[7],g=n[11],C=n[15],A=s[0],w=s[4],P=s[8],S=s[12],v=s[1],R=s[5],L=s[9],z=s[13],Y=s[2],H=s[6],V=s[10],j=s[14],G=s[3],de=s[7],pe=s[11],ye=s[15];return r[0]=o*A+a*v+l*Y+c*G,r[4]=o*w+a*R+l*H+c*de,r[8]=o*P+a*L+l*V+c*pe,r[12]=o*S+a*z+l*j+c*ye,r[1]=h*A+u*v+f*Y+p*G,r[5]=h*w+u*R+f*H+p*de,r[9]=h*P+u*L+f*V+p*pe,r[13]=h*S+u*z+f*j+p*ye,r[2]=_*A+y*v+m*Y+d*G,r[6]=_*w+y*R+m*H+d*de,r[10]=_*P+y*L+m*V+d*pe,r[14]=_*S+y*z+m*j+d*ye,r[3]=E*A+x*v+g*Y+C*G,r[7]=E*w+x*R+g*H+C*de,r[11]=E*P+x*L+g*V+C*pe,r[15]=E*S+x*z+g*j+C*ye,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],p=e[14],_=e[3],y=e[7],m=e[11],d=e[15];return _*(+r*l*u-s*c*u-r*a*f+n*c*f+s*a*p-n*l*p)+y*(+t*l*p-t*c*f+r*o*f-s*o*p+s*c*h-r*l*h)+m*(+t*c*u-t*a*p-r*o*u+n*o*p+r*a*h-n*c*h)+d*(-s*a*h-t*l*u+t*a*f+s*o*u-n*o*f+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],p=e[11],_=e[12],y=e[13],m=e[14],d=e[15],E=u*m*c-y*f*c+y*l*p-a*m*p-u*l*d+a*f*d,x=_*f*c-h*m*c-_*l*p+o*m*p+h*l*d-o*f*d,g=h*y*c-_*u*c+_*a*p-o*y*p-h*a*d+o*u*d,C=_*u*l-h*y*l-_*a*f+o*y*f+h*a*m-o*u*m,A=t*E+n*x+s*g+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let w=1/A;return e[0]=E*w,e[1]=(y*f*r-u*m*r-y*s*p+n*m*p+u*s*d-n*f*d)*w,e[2]=(a*m*r-y*l*r+y*s*c-n*m*c-a*s*d+n*l*d)*w,e[3]=(u*l*r-a*f*r-u*s*c+n*f*c+a*s*p-n*l*p)*w,e[4]=x*w,e[5]=(h*m*r-_*f*r+_*s*p-t*m*p-h*s*d+t*f*d)*w,e[6]=(_*l*r-o*m*r-_*s*c+t*m*c+o*s*d-t*l*d)*w,e[7]=(o*f*r-h*l*r+h*s*c-t*f*c-o*s*p+t*l*p)*w,e[8]=g*w,e[9]=(_*u*r-h*y*r-_*n*p+t*y*p+h*n*d-t*u*d)*w,e[10]=(o*y*r-_*a*r+_*n*c-t*y*c-o*n*d+t*a*d)*w,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*p-t*a*p)*w,e[12]=C*w,e[13]=(h*y*s-_*u*s+_*n*f-t*y*f-h*n*m+t*u*m)*w,e[14]=(_*a*s-o*y*s-_*n*l+t*y*l+o*n*m-t*a*m)*w,e[15]=(o*u*s-h*a*s+h*n*l-t*u*l-o*n*f+t*a*f)*w,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,f=r*c,p=r*h,_=r*u,y=o*h,m=o*u,d=a*u,E=l*c,x=l*h,g=l*u,C=n.x,A=n.y,w=n.z;return s[0]=(1-(y+d))*C,s[1]=(p+g)*C,s[2]=(_-x)*C,s[3]=0,s[4]=(p-g)*A,s[5]=(1-(f+d))*A,s[6]=(m+E)*A,s[7]=0,s[8]=(_+x)*w,s[9]=(m-E)*w,s[10]=(1-(f+y))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=ns.set(s[0],s[1],s[2]).length(),o=ns.set(s[4],s[5],s[6]).length(),a=ns.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Cn.copy(this);let c=1/r,h=1/o,u=1/a;return Cn.elements[0]*=c,Cn.elements[1]*=c,Cn.elements[2]*=c,Cn.elements[4]*=h,Cn.elements[5]*=h,Cn.elements[6]*=h,Cn.elements[8]*=u,Cn.elements[9]*=u,Cn.elements[10]*=u,t.setFromRotationMatrix(Cn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=Pn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s),_,y;if(l)_=r/(o-r),y=o*r/(o-r);else if(a===Pn)_=-(o+r)/(o-r),y=-2*o*r/(o-r);else if(a===sr)_=-o/(o-r),y=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Pn,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s),_,y;if(l)_=1/(o-r),y=o/(o-r);else if(a===Pn)_=-2/(o-r),y=-(o+r)/(o-r);else if(a===sr)_=-1/(o-r),y=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=_,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ns=new F,Cn=new Qe,ff=new F(0,0,0),pf=new F(1,1,1),ai=new F,no=new F,cn=new F,vh=new Qe,Mh=new Ot,bn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-et(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(et(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-et(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(et(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return vh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(vh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Mh.setFromEuler(this),this.setFromQuaternion(Mh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};bn.DEFAULT_ORDER="XYZ";var lr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},mf=0,Sh=new F,is=new Ot,Wn=new Qe,io=new F,Ys=new F,gf=new F,_f=new Ot,bh=new F(1,0,0),Eh=new F(0,1,0),wh=new F(0,0,1),Th={type:"added"},xf={type:"removed"},ss={type:"childadded",child:null},Ll={type:"childremoved",child:null},At=class i extends Zn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mf++}),this.uuid=As(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new F,t=new bn,n=new Ot,s=new F(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Qe},normalMatrix:{value:new Ye}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return is.setFromAxisAngle(e,t),this.quaternion.multiply(is),this}rotateOnWorldAxis(e,t){return is.setFromAxisAngle(e,t),this.quaternion.premultiply(is),this}rotateX(e){return this.rotateOnAxis(bh,e)}rotateY(e){return this.rotateOnAxis(Eh,e)}rotateZ(e){return this.rotateOnAxis(wh,e)}translateOnAxis(e,t){return Sh.copy(e).applyQuaternion(this.quaternion),this.position.add(Sh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(bh,e)}translateY(e){return this.translateOnAxis(Eh,e)}translateZ(e){return this.translateOnAxis(wh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Wn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?io.copy(e):io.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Wn.lookAt(Ys,io,this.up):Wn.lookAt(io,Ys,this.up),this.quaternion.setFromRotationMatrix(Wn),s&&(Wn.extractRotation(s.matrixWorld),is.setFromRotationMatrix(Wn),this.quaternion.premultiply(is.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Th),ss.child=e,this.dispatchEvent(ss),ss.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xf),Ll.child=e,this.dispatchEvent(Ll),Ll.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Wn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Wn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Wn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Th),ss.child=e,this.dispatchEvent(ss),ss.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,e,gf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,_f,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),p=o(e.animations),_=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};At.DEFAULT_UP=new F(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var In=new F,Xn=new F,Dl=new F,qn=new F,rs=new F,os=new F,Ah=new F,Ul=new F,Nl=new F,Fl=new F,Ol=new ot,Bl=new ot,kl=new ot,hi=class i{constructor(e=new F,t=new F,n=new F){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),In.subVectors(e,t),s.cross(In);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){In.subVectors(s,t),Xn.subVectors(n,t),Dl.subVectors(e,t);let o=In.dot(In),a=In.dot(Xn),l=In.dot(Dl),c=Xn.dot(Xn),h=Xn.dot(Dl),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let f=1/u,p=(c*l-a*h)*f,_=(o*h-a*l)*f;return r.set(1-p-_,_,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,qn)===null?!1:qn.x>=0&&qn.y>=0&&qn.x+qn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,qn.x),l.addScaledVector(o,qn.y),l.addScaledVector(a,qn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Ol.setScalar(0),Bl.setScalar(0),kl.setScalar(0),Ol.fromBufferAttribute(e,t),Bl.fromBufferAttribute(e,n),kl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Ol,r.x),o.addScaledVector(Bl,r.y),o.addScaledVector(kl,r.z),o}static isFrontFacing(e,t,n,s){return In.subVectors(n,t),Xn.subVectors(e,t),In.cross(Xn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return In.subVectors(this.c,this.b),Xn.subVectors(this.a,this.b),In.cross(Xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;rs.subVectors(s,n),os.subVectors(r,n),Ul.subVectors(e,n);let l=rs.dot(Ul),c=os.dot(Ul);if(l<=0&&c<=0)return t.copy(n);Nl.subVectors(e,s);let h=rs.dot(Nl),u=os.dot(Nl);if(h>=0&&u<=h)return t.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(rs,o);Fl.subVectors(e,r);let p=rs.dot(Fl),_=os.dot(Fl);if(_>=0&&p<=_)return t.copy(r);let y=p*c-l*_;if(y<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(n).addScaledVector(os,a);let m=h*_-p*u;if(m<=0&&u-h>=0&&p-_>=0)return Ah.subVectors(r,s),a=(u-h)/(u-h+(p-_)),t.copy(s).addScaledVector(Ah,a);let d=1/(m+y+f);return o=y*d,a=f*d,t.copy(n).addScaledVector(rs,o).addScaledVector(os,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Du={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},li={h:0,s:0,l:0},so={h:0,s:0,l:0};function zl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ve=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=It){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=nt.workingColorSpace){return this.r=e,this.g=t,this.b=n,nt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=nt.workingColorSpace){if(e=lf(e,1),t=et(t,0,1),n=et(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=zl(o,r,e+1/3),this.g=zl(o,r,e),this.b=zl(o,r,e-1/3)}return nt.colorSpaceToWorking(this,s),this}setStyle(e,t=It){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=It){let n=Du[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Yn(e.r),this.g=Yn(e.g),this.b=Yn(e.b),this}copyLinearToSRGB(e){return this.r=us(e.r),this.g=us(e.g),this.b=us(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=It){return nt.workingToColorSpace(Ht.copy(this),e),Math.round(et(Ht.r*255,0,255))*65536+Math.round(et(Ht.g*255,0,255))*256+Math.round(et(Ht.b*255,0,255))}getHexString(e=It){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(Ht.copy(this),t);let n=Ht.r,s=Ht.g,r=Ht.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(Ht.copy(this),t),e.r=Ht.r,e.g=Ht.g,e.b=Ht.b,e}getStyle(e=It){nt.workingToColorSpace(Ht.copy(this),e);let t=Ht.r,n=Ht.g,s=Ht.b;return e!==It?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(li),this.setHSL(li.h+e,li.s+t,li.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(li),e.getHSL(so);let n=Sl(li.h,so.h,t),s=Sl(li.s,so.s,t),r=Sl(li.l,so.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ht=new Ve;Ve.NAMES=Du;var yf=0,On=class extends Zn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:yf++}),this.uuid=As(),this.name="",this.type="Material",this.blending=Li,this.side=Qt,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Eo,this.blendDst=wo,this.blendEquation=di,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=Di,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ec,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ii,this.stencilZFail=Ii,this.stencilZPass=Ii,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Li&&(n.blending=this.blending),this.side!==Qt&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Eo&&(n.blendSrc=this.blendSrc),this.blendDst!==wo&&(n.blendDst=this.blendDst),this.blendEquation!==di&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Di&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ec&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ii&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ii&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ii&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},nn=class extends On{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=ca,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Tt=new F,ro=new be,vf=0,qe=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:vf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=tc,this.updateRanges=[],this.gpuType=pn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ro.fromBufferAttribute(this,t),ro.applyMatrix3(e),this.setXY(t,ro.x,ro.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix3(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix4(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyNormalMatrix(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.transformDirection(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ws(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=jt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ws(t,this.array)),t}setX(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ws(t,this.array)),t}setY(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ws(t,this.array)),t}setZ(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ws(t,this.array)),t}setW(e,t){return this.normalized&&(t=jt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=jt(t,this.array),n=jt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=jt(t,this.array),n=jt(n,this.array),s=jt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=jt(t,this.array),n=jt(n,this.array),s=jt(s,this.array),r=jt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==tc&&(e.usage=this.usage),e}};var fi=class extends qe{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var pi=class extends qe{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var ut=class extends qe{constructor(e,t,n){super(new Float32Array(e),t,n)}},Mf=0,Mn=new Qe,Hl=new At,as=new F,hn=new tn,Zs=new tn,Dt=new F,st=class i extends Zn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mf++}),this.uuid=As(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Sc(e)?pi:fi)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ye().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Mn.makeRotationFromQuaternion(e),this.applyMatrix4(Mn),this}rotateX(e){return Mn.makeRotationX(e),this.applyMatrix4(Mn),this}rotateY(e){return Mn.makeRotationY(e),this.applyMatrix4(Mn),this}rotateZ(e){return Mn.makeRotationZ(e),this.applyMatrix4(Mn),this}translate(e,t,n){return Mn.makeTranslation(e,t,n),this.applyMatrix4(Mn),this}scale(e,t,n){return Mn.makeScale(e,t,n),this.applyMatrix4(Mn),this}lookAt(e){return Hl.lookAt(e),Hl.updateMatrix(),this.applyMatrix4(Hl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(as).negate(),this.translate(as.x,as.y,as.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ut(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new tn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];hn.setFromBufferAttribute(r),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ln);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(e){let n=this.boundingSphere.center;if(hn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Zs.setFromBufferAttribute(a),this.morphTargetsRelative?(Dt.addVectors(hn.min,Zs.min),hn.expandByPoint(Dt),Dt.addVectors(hn.max,Zs.max),hn.expandByPoint(Dt)):(hn.expandByPoint(Zs.min),hn.expandByPoint(Zs.max))}hn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Dt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Dt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Dt.fromBufferAttribute(a,c),l&&(as.fromBufferAttribute(e,c),Dt.add(as)),s=Math.max(s,n.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new qe(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new F,l[P]=new F;let c=new F,h=new F,u=new F,f=new be,p=new be,_=new be,y=new F,m=new F;function d(P,S,v){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,v),f.fromBufferAttribute(r,P),p.fromBufferAttribute(r,S),_.fromBufferAttribute(r,v),h.sub(c),u.sub(c),p.sub(f),_.sub(f);let R=1/(p.x*_.y-_.x*p.y);isFinite(R)&&(y.copy(h).multiplyScalar(_.y).addScaledVector(u,-p.y).multiplyScalar(R),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-_.x).multiplyScalar(R),a[P].add(y),a[S].add(y),a[v].add(y),l[P].add(m),l[S].add(m),l[v].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let P=0,S=E.length;P<S;++P){let v=E[P],R=v.start,L=v.count;for(let z=R,Y=R+L;z<Y;z+=3)d(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let x=new F,g=new F,C=new F,A=new F;function w(P){C.fromBufferAttribute(s,P),A.copy(C);let S=a[P];x.copy(S),x.sub(C.multiplyScalar(C.dot(S))).normalize(),g.crossVectors(A,S);let R=g.dot(l[P])<0?-1:1;o.setXYZW(P,x.x,x.y,x.z,R)}for(let P=0,S=E.length;P<S;++P){let v=E[P],R=v.start,L=v.count;for(let z=R,Y=R+L;z<Y;z+=3)w(e.getX(z+0)),w(e.getX(z+1)),w(e.getX(z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new qe(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new F,r=new F,o=new F,a=new F,l=new F,c=new F,h=new F,u=new F;if(e)for(let f=0,p=e.count;f<p;f+=3){let _=e.getX(f+0),y=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,f=new c.constructor(l.length*h),p=0,_=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?p=l[y]*a.data.stride+a.offset:p=l[y]*h;for(let d=0;d<h;d++)f[_++]=c[p++]}return new qe(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let f=c[h],p=e(f,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Rh=new Qe,Ri=new ar,oo=new Ln,Ch=new F,ao=new F,lo=new F,co=new F,Vl=new F,ho=new F,Ih=new F,uo=new F,Ke=class extends At{constructor(e=new st,t=new nn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){ho.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Vl.fromBufferAttribute(u,e),o?ho.addScaledVector(Vl,h):ho.addScaledVector(Vl.sub(t),h))}t.add(ho)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),oo.copy(n.boundingSphere),oo.applyMatrix4(r),Ri.copy(e.ray).recast(e.near),!(oo.containsPoint(Ri.origin)===!1&&(Ri.intersectSphere(oo,Ch)===null||Ri.origin.distanceToSquared(Ch)>(e.far-e.near)**2))&&(Rh.copy(r).invert(),Ri.copy(e.ray).applyMatrix4(Rh),!(n.boundingBox!==null&&Ri.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ri)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,y=f.length;_<y;_++){let m=f[_],d=o[m.materialIndex],E=Math.max(m.start,p.start),x=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let g=E,C=x;g<C;g+=3){let A=a.getX(g),w=a.getX(g+1),P=a.getX(g+2);s=fo(this,d,e,n,c,h,u,A,w,P),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),y=Math.min(a.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){let E=a.getX(m),x=a.getX(m+1),g=a.getX(m+2);s=fo(this,o,e,n,c,h,u,E,x,g),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,y=f.length;_<y;_++){let m=f[_],d=o[m.materialIndex],E=Math.max(m.start,p.start),x=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let g=E,C=x;g<C;g+=3){let A=g,w=g+1,P=g+2;s=fo(this,d,e,n,c,h,u,A,w,P),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){let E=m,x=m+1,g=m+2;s=fo(this,o,e,n,c,h,u,E,x,g),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Sf(i,e,t,n,s,r,o,a){let l;if(e.side===Rt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Qt,a),l===null)return null;uo.copy(a),uo.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(uo);return c<t.near||c>t.far?null:{distance:c,point:uo.clone(),object:i}}function fo(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,ao),i.getVertexPosition(l,lo),i.getVertexPosition(c,co);let h=Sf(i,e,t,n,ao,lo,co,Ih);if(h){let u=new F;hi.getBarycoord(Ih,ao,lo,co,u),s&&(h.uv=hi.getInterpolatedAttribute(s,a,l,c,u,new be)),r&&(h.uv1=hi.getInterpolatedAttribute(r,a,l,c,u,new be)),o&&(h.normal=hi.getInterpolatedAttribute(o,a,l,c,u,new F),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new F,materialIndex:0};hi.getNormal(ao,lo,co,f.normal),h.face=f,h.barycoord=u}return h}var Bn=class i extends st{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],f=0,p=0;_("z","y","x",-1,-1,n,t,e,o,r,0),_("z","y","x",1,-1,n,t,-e,o,r,1),_("x","z","y",1,1,e,n,t,s,o,2),_("x","z","y",1,-1,e,n,-t,s,o,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ut(c,3)),this.setAttribute("normal",new ut(h,3)),this.setAttribute("uv",new ut(u,2));function _(y,m,d,E,x,g,C,A,w,P,S){let v=g/w,R=C/P,L=g/2,z=C/2,Y=A/2,H=w+1,V=P+1,j=0,G=0,de=new F;for(let pe=0;pe<V;pe++){let ye=pe*R-z;for(let Me=0;Me<H;Me++){let Ee=Me*v-L;de[y]=Ee*E,de[m]=ye*x,de[d]=Y,c.push(de.x,de.y,de.z),de[y]=0,de[m]=0,de[d]=A>0?1:-1,h.push(de.x,de.y,de.z),u.push(Me/w),u.push(1-pe/P),j+=1}}for(let pe=0;pe<P;pe++)for(let ye=0;ye<w;ye++){let Me=f+ye+H*pe,Ee=f+ye+H*(pe+1),Ze=f+(ye+1)+H*(pe+1),Ge=f+(ye+1)+H*pe;l.push(Me,Ee,Ge),l.push(Ee,Ze,Ge),G+=6}a.addGroup(p,G,S),p+=G,f+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Hi(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Gt(i){let e={};for(let t=0;t<i.length;t++){let n=Hi(i[t]);for(let s in n)e[s]=n[s]}return e}function bf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function bc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}var Uu={clone:Hi,merge:Gt},Ef=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,wf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Dn=class extends On{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ef,this.fragmentShader=wf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Hi(e.uniforms),this.uniformsGroups=bf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},cr=class extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=Pn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ci=new F,Ph=new be,Lh=new be,Ft=class extends cr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Co*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ml*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Co*2*Math.atan(Math.tan(Ml*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ci.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ci.x,ci.y).multiplyScalar(-e/ci.z),ci.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ci.x,ci.y).multiplyScalar(-e/ci.z)}getViewSize(e,t){return this.getViewBounds(e,Ph,Lh),t.subVectors(Lh,Ph)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ml*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ls=-90,cs=1,Do=class extends At{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ft(ls,cs,e,t);s.layers=this.layers,this.add(s);let r=new Ft(ls,cs,e,t);r.layers=this.layers,this.add(r);let o=new Ft(ls,cs,e,t);o.layers=this.layers,this.add(o);let a=new Ft(ls,cs,e,t);a.layers=this.layers,this.add(a);let l=new Ft(ls,cs,e,t);l.layers=this.layers,this.add(l);let c=new Ft(ls,cs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Pn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===sr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,p),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},hr=class extends qt{constructor(e=[],t=ki,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Uo=class extends Sn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new hr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Bn(5,5,5),r=new Dn({name:"CubemapFromEquirect",uniforms:Hi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Rt,blending:jn});r.uniforms.tEquirect.value=t;let o=new Ke(s,r),a=t.minFilter;return t.minFilter===yi&&(t.minFilter=en),new Do(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},it=class extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}},Tf={type:"move"},ms=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new it,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new it,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new it,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),d=this._getHandJoint(c,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,_=.005;c.inputState.pinching&&f>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Tf)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new it;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Jn=class extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bn,this.environmentIntensity=1,this.environmentRotation=new bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var mi=class extends qt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Vt,h=Vt,u,f){super(null,o,a,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ur=class extends qe{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},hs=new Qe,Dh=new Qe,po=[],Uh=new tn,Af=new Qe,Js=new Ke,$s=new Ln,dr=class extends Ke{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ur(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Af)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new tn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,hs),Uh.copy(e.boundingBox).applyMatrix4(hs),this.boundingBox.union(Uh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ln),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,hs),$s.copy(e.boundingSphere).applyMatrix4(hs),this.boundingSphere.union($s)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Js.geometry=this.geometry,Js.material=this.material,Js.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$s.copy(this.boundingSphere),$s.applyMatrix4(n),e.ray.intersectsSphere($s)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,hs),Dh.multiplyMatrices(n,hs),Js.matrixWorld=Dh,Js.raycast(e,po);for(let o=0,a=po.length;o<a;o++){let l=po[o];l.instanceId=r,l.object=this,t.push(l)}po.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ur(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new mi(new Float32Array(s*this.count),s,this.count,_a,pn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Gl=new F,Rf=new F,Cf=new Ye,Fn=class{constructor(e=new F(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Gl.subVectors(n,t).cross(Rf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Gl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Cf.getNormalMatrix(e),s=this.coplanarPoint(Gl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ci=new Ln,If=new be(.5,.5),mo=new F,gs=class{constructor(e=new Fn,t=new Fn,n=new Fn,s=new Fn,r=new Fn,o=new Fn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Pn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],p=r[7],_=r[8],y=r[9],m=r[10],d=r[11],E=r[12],x=r[13],g=r[14],C=r[15];if(s[0].setComponents(c-o,p-h,d-_,C-E).normalize(),s[1].setComponents(c+o,p+h,d+_,C+E).normalize(),s[2].setComponents(c+a,p+u,d+y,C+x).normalize(),s[3].setComponents(c-a,p-u,d-y,C-x).normalize(),n)s[4].setComponents(l,f,m,g).normalize(),s[5].setComponents(c-l,p-f,d-m,C-g).normalize();else if(s[4].setComponents(c-l,p-f,d-m,C-g).normalize(),t===Pn)s[5].setComponents(c+l,p+f,d+m,C+g).normalize();else if(t===sr)s[5].setComponents(l,f,m,g).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ci.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ci.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ci)}intersectsSprite(e){Ci.center.set(0,0,0);let t=If.distanceTo(e.center);return Ci.radius=.7071067811865476+t,Ci.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ci)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(mo.x=s.normal.x>0?e.max.x:e.min.x,mo.y=s.normal.y>0?e.max.y:e.min.y,mo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(mo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var $n=class extends On{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},No=new F,Fo=new F,Nh=new Qe,Ks=new ar,go=new Ln,Wl=new F,Fh=new F,Ni=class extends At{constructor(e=new st,t=new $n){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)No.fromBufferAttribute(t,s-1),Fo.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=No.distanceTo(Fo);e.setAttribute("lineDistance",new ut(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),go.copy(n.boundingSphere),go.applyMatrix4(s),go.radius+=r,e.ray.intersectsSphere(go)===!1)return;Nh.copy(s).invert(),Ks.copy(e.ray).applyMatrix4(Nh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){let p=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let y=p,m=_-1;y<m;y+=c){let d=h.getX(y),E=h.getX(y+1),x=_o(this,e,Ks,l,d,E,y);x&&t.push(x)}if(this.isLineLoop){let y=h.getX(_-1),m=h.getX(p),d=_o(this,e,Ks,l,y,m,_-1);d&&t.push(d)}}else{let p=Math.max(0,o.start),_=Math.min(f.count,o.start+o.count);for(let y=p,m=_-1;y<m;y+=c){let d=_o(this,e,Ks,l,y,y+1,y);d&&t.push(d)}if(this.isLineLoop){let y=_o(this,e,Ks,l,_-1,p,_-1);y&&t.push(y)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function _o(i,e,t,n,s,r,o){let a=i.geometry.attributes.position;if(No.fromBufferAttribute(a,s),Fo.fromBufferAttribute(a,r),t.distanceSqToSegment(No,Fo,Wl,Fh)>n)return;Wl.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Wl);if(!(c<e.near||c>e.far))return{distance:c,point:Fh.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var Oh=new F,Bh=new F,fr=class extends Ni{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Oh.fromBufferAttribute(t,s),Bh.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Oh.distanceTo(Bh);e.setAttribute("lineDistance",new ut(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var pr=class extends qt{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},mr=class extends qt{constructor(e,t,n=vi,s,r,o,a=Vt,l=Vt,c,h=ds,u=1){if(h!==ds&&h!==Es)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:u};super(f,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ps(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},gr=class extends qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var gt=class i extends st{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],f=[],p=[],_=0,y=[],m=n/2,d=0;E(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new ut(u,3)),this.setAttribute("normal",new ut(f,3)),this.setAttribute("uv",new ut(p,2));function E(){let g=new F,C=new F,A=0,w=(t-e)/n;for(let P=0;P<=r;P++){let S=[],v=P/r,R=v*(t-e)+e;for(let L=0;L<=s;L++){let z=L/s,Y=z*l+a,H=Math.sin(Y),V=Math.cos(Y);C.x=R*H,C.y=-v*n+m,C.z=R*V,u.push(C.x,C.y,C.z),g.set(H,w,V).normalize(),f.push(g.x,g.y,g.z),p.push(z,1-v),S.push(_++)}y.push(S)}for(let P=0;P<s;P++)for(let S=0;S<r;S++){let v=y[S][P],R=y[S+1][P],L=y[S+1][P+1],z=y[S][P+1];(e>0||S!==0)&&(h.push(v,R,z),A+=3),(t>0||S!==r-1)&&(h.push(R,L,z),A+=3)}c.addGroup(d,A,0),d+=A}function x(g){let C=_,A=new be,w=new F,P=0,S=g===!0?e:t,v=g===!0?1:-1;for(let L=1;L<=s;L++)u.push(0,m*v,0),f.push(0,v,0),p.push(.5,.5),_++;let R=_;for(let L=0;L<=s;L++){let Y=L/s*l+a,H=Math.cos(Y),V=Math.sin(Y);w.x=S*V,w.y=m*v,w.z=S*H,u.push(w.x,w.y,w.z),f.push(0,v,0),A.x=H*.5+.5,A.y=V*.5*v+.5,p.push(A.x,A.y),_++}for(let L=0;L<s;L++){let z=C+L,Y=R+L;g===!0?h.push(Y,Y+1,z):h.push(Y+1,Y,z),P+=3}c.addGroup(d,P,g===!0?1:2),d+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Oo=class i extends gt{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var un=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],f=n[s+1]-h,p=(o-h)/f;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new be:new F);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new F,s=[],r=[],o=[],a=new F,l=new Qe;for(let p=0;p<=e;p++){let _=p/e;s[p]=this.getTangentAt(_,new F)}r[0]=new F,o[0]=new F;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();let _=Math.acos(et(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,_))}o[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(et(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let _=1;_<=e;_++)r[_].applyMatrix4(l.makeRotationAxis(s[_],p*_)),o[_].crossVectors(s[_],r[_])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},_s=class extends un{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new be){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,p=c-this.aY;l=f*h-p*u+this.aX,c=f*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Bo=class extends _s{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Ec(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,p*=h,s(o,a,f,p)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var xo=new F,Xl=new Ec,ql=new Ec,Yl=new Ec,dn=class extends un{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new F){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(xo.subVectors(s[0],s[1]).add(s[0]),c=xo);let u=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(xo.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=xo),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,_=Math.pow(c.distanceToSquared(u),p),y=Math.pow(u.distanceToSquared(f),p),m=Math.pow(f.distanceToSquared(h),p);y<1e-4&&(y=1),_<1e-4&&(_=y),m<1e-4&&(m=y),Xl.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,_,y,m),ql.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,_,y,m),Yl.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,_,y,m)}else this.curveType==="catmullrom"&&(Xl.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),ql.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Yl.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(Xl.calc(l),ql.calc(l),Yl.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new F().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function kh(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function Pf(i,e){let t=1-i;return t*t*e}function Lf(i,e){return 2*(1-i)*i*e}function Df(i,e){return i*i*e}function er(i,e,t,n){return Pf(i,e)+Lf(i,t)+Df(i,n)}function Uf(i,e){let t=1-i;return t*t*t*e}function Nf(i,e){let t=1-i;return 3*t*t*i*e}function Ff(i,e){return 3*(1-i)*i*i*e}function Of(i,e){return i*i*i*e}function tr(i,e,t,n,s){return Uf(i,e)+Nf(i,t)+Ff(i,n)+Of(i,s)}var _r=class extends un{constructor(e=new be,t=new be,n=new be,s=new be){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new be){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(tr(e,s.x,r.x,o.x,a.x),tr(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ko=class extends un{constructor(e=new F,t=new F,n=new F,s=new F){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new F){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(tr(e,s.x,r.x,o.x,a.x),tr(e,s.y,r.y,o.y,a.y),tr(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},xr=class extends un{constructor(e=new be,t=new be){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new be){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new be){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},zo=class extends un{constructor(e=new F,t=new F){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new F){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new F){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},yr=class extends un{constructor(e=new be,t=new be,n=new be){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new be){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(er(e,s.x,r.x,o.x),er(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},vr=class extends un{constructor(e=new F,t=new F,n=new F){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new F){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(er(e,s.x,r.x,o.x),er(e,s.y,r.y,o.y),er(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mr=class extends un{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new be){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(kh(a,l.x,c.x,h.x,u.x),kh(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new be().fromArray(s))}return this}},Ho=Object.freeze({__proto__:null,ArcCurve:Bo,CatmullRomCurve3:dn,CubicBezierCurve:_r,CubicBezierCurve3:ko,EllipseCurve:_s,LineCurve:xr,LineCurve3:zo,QuadraticBezierCurve:yr,QuadraticBezierCurve3:vr,SplineCurve:Mr}),Vo=class extends un{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ho[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Ho[s.type]().fromJSON(s))}return this}},Sr=class extends Vo{constructor(e){super(),this.type="Path",this.currentPoint=new be,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new xr(this.currentPoint.clone(),new be(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new yr(this.currentPoint.clone(),new be(e,t),new be(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new _r(this.currentPoint.clone(),new be(e,t),new be(n,s),new be(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Mr(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new _s(e,t,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},xs=class extends Sr{constructor(e){super(e),this.uuid=As(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Sr().fromJSON(s))}return this}};function Bf(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Nu(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=Gf(i,e,r,t)),i.length>80*t){a=1/0,l=1/0;let h=-1/0,u=-1/0;for(let f=t;f<s;f+=t){let p=i[f],_=i[f+1];p<a&&(a=p),_<l&&(l=_),p>h&&(h=p),_>u&&(u=_)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return br(r,o,t,a,l,c,0),o}function Nu(i,e,t,n,s){let r;if(s===ep(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=zh(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=zh(o/n|0,i[o],i[o+1],r);return r&&ys(r,r.next)&&(wr(r),r=r.next),r}function Fi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(ys(t,t.next)||yt(t.prev,t,t.next)===0)){if(wr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function br(i,e,t,n,s,r,o){if(!i)return;!o&&r&&Zf(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?zf(i,n,s,r):kf(i)){e.push(l.i,i.i,c.i),wr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Hf(Fi(i),e),br(i,e,t,n,s,r,2)):o===2&&Vf(i,e,t,n,s,r):br(Fi(i),e,t,n,s,r,1);break}}}function kf(i){let e=i.prev,t=i,n=i.next;if(yt(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=Math.min(s,r,o),u=Math.min(a,l,c),f=Math.max(s,r,o),p=Math.max(a,l,c),_=n.next;for(;_!==e;){if(_.x>=h&&_.x<=f&&_.y>=u&&_.y<=p&&Qs(s,a,r,l,o,c,_.x,_.y)&&yt(_.prev,_,_.next)>=0)return!1;_=_.next}return!0}function zf(i,e,t,n){let s=i.prev,r=i,o=i.next;if(yt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,f=o.y,p=Math.min(a,l,c),_=Math.min(h,u,f),y=Math.max(a,l,c),m=Math.max(h,u,f),d=nc(p,_,e,t,n),E=nc(y,m,e,t,n),x=i.prevZ,g=i.nextZ;for(;x&&x.z>=d&&g&&g.z<=E;){if(x.x>=p&&x.x<=y&&x.y>=_&&x.y<=m&&x!==s&&x!==o&&Qs(a,h,l,u,c,f,x.x,x.y)&&yt(x.prev,x,x.next)>=0||(x=x.prevZ,g.x>=p&&g.x<=y&&g.y>=_&&g.y<=m&&g!==s&&g!==o&&Qs(a,h,l,u,c,f,g.x,g.y)&&yt(g.prev,g,g.next)>=0))return!1;g=g.nextZ}for(;x&&x.z>=d;){if(x.x>=p&&x.x<=y&&x.y>=_&&x.y<=m&&x!==s&&x!==o&&Qs(a,h,l,u,c,f,x.x,x.y)&&yt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;g&&g.z<=E;){if(g.x>=p&&g.x<=y&&g.y>=_&&g.y<=m&&g!==s&&g!==o&&Qs(a,h,l,u,c,f,g.x,g.y)&&yt(g.prev,g,g.next)>=0)return!1;g=g.nextZ}return!0}function Hf(i,e){let t=i;do{let n=t.prev,s=t.next.next;!ys(n,s)&&Ou(n,t,t.next,s)&&Er(n,s)&&Er(s,n)&&(e.push(n.i,t.i,s.i),wr(t),wr(t.next),t=i=s),t=t.next}while(t!==i);return Fi(t)}function Vf(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Kf(o,a)){let l=Bu(o,a);o=Fi(o,o.next),l=Fi(l,l.next),br(o,e,t,n,s,r,0),br(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Gf(i,e,t,n){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=Nu(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push($f(c))}s.sort(Wf);for(let r=0;r<s.length;r++)t=Xf(s[r],t);return t}function Wf(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Xf(i,e){let t=qf(i,e);if(!t)return e;let n=Bu(t,i);return Fi(n,n.next),Fi(t,t.next)}function qf(i,e){let t=e,n=i.x,s=i.y,r=-1/0,o;if(ys(i,t))return t;do{if(ys(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Fu(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let u=Math.abs(s-t.y)/(n-t.x);Er(t,i)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Yf(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function Yf(i,e){return yt(i.prev,i,e.prev)<0&&yt(e.next,i,i.next)<0}function Zf(i,e,t,n){let s=i;do s.z===0&&(s.z=nc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Jf(s)}function Jf(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function nc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function $f(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Fu(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function Qs(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&Fu(i,e,t,n,s,r,o,a)}function Kf(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!jf(i,e)&&(Er(i,e)&&Er(e,i)&&Qf(i,e)&&(yt(i.prev,i,e.prev)||yt(i,e.prev,e))||ys(i,e)&&yt(i.prev,i,i.next)>0&&yt(e.prev,e,e.next)>0)}function yt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function ys(i,e){return i.x===e.x&&i.y===e.y}function Ou(i,e,t,n){let s=vo(yt(i,e,t)),r=vo(yt(i,e,n)),o=vo(yt(t,n,i)),a=vo(yt(t,n,e));return!!(s!==r&&o!==a||s===0&&yo(i,t,e)||r===0&&yo(i,n,e)||o===0&&yo(t,i,n)||a===0&&yo(t,e,n))}function yo(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function vo(i){return i>0?1:i<0?-1:0}function jf(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Ou(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Er(i,e){return yt(i.prev,i,i.next)<0?yt(i,e,i.next)>=0&&yt(i,i.prev,e)>=0:yt(i,e,i.prev)<0||yt(i,i.next,e)<0}function Qf(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Bu(i,e){let t=ic(i.i,i.x,i.y),n=ic(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function zh(i,e,t,n){let s=ic(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function wr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function ic(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function ep(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var sc=class{static triangulate(e,t,n=2){return Bf(e,t,n)}},Pi=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Hh(e),Vh(n,e);let o=e.length;t.forEach(Hh);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Vh(n,t[l]);let a=sc.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Hh(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Vh(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var Tr=class i extends st{constructor(e=new xs([new be(.5,.5),new be(-.5,.5),new be(-.5,-.5),new be(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new ut(s,3)),this.setAttribute("uv",new ut(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,_=t.bevelSize!==void 0?t.bevelSize:p-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,d=t.extrudePath,E=t.UVGenerator!==void 0?t.UVGenerator:tp,x,g=!1,C,A,w,P;d&&(x=d.getSpacedPoints(h),g=!0,f=!1,C=d.computeFrenetFrames(h,!1),A=new F,w=new F,P=new F),f||(m=0,p=0,_=0,y=0);let S=a.extractPoints(c),v=S.shape,R=S.holes;if(!Pi.isClockWise(v)){v=v.reverse();for(let ce=0,oe=R.length;ce<oe;ce++){let te=R[ce];Pi.isClockWise(te)&&(R[ce]=te.reverse())}}function z(ce){let te=10000000000000001e-36,se=ce[0];for(let ve=1;ve<=ce.length;ve++){let he=ve%ce.length,Se=ce[he],We=Se.x-se.x,ze=Se.y-se.y,I=We*We+ze*ze,b=Math.max(Math.abs(Se.x),Math.abs(Se.y),Math.abs(se.x),Math.abs(se.y)),X=te*b*b;if(I<=X){ce.splice(he,1),ve--;continue}se=Se}}z(v),R.forEach(z);let Y=R.length,H=v;for(let ce=0;ce<Y;ce++){let oe=R[ce];v=v.concat(oe)}function V(ce,oe,te){return oe||console.error("THREE.ExtrudeGeometry: vec does not exist"),ce.clone().addScaledVector(oe,te)}let j=v.length;function G(ce,oe,te){let se,ve,he,Se=ce.x-oe.x,We=ce.y-oe.y,ze=te.x-ce.x,I=te.y-ce.y,b=Se*Se+We*We,X=Se*I-We*ze;if(Math.abs(X)>Number.EPSILON){let J=Math.sqrt(b),ue=Math.sqrt(ze*ze+I*I),Q=oe.x-We/J,Ue=oe.y+Se/J,xe=te.x-I/ue,Ie=te.y+ze/ue,Le=((xe-Q)*I-(Ie-Ue)*ze)/(Se*I-We*ze);se=Q+Se*Le-ce.x,ve=Ue+We*Le-ce.y;let M=se*se+ve*ve;if(M<=2)return new be(se,ve);he=Math.sqrt(M/2)}else{let J=!1;Se>Number.EPSILON?ze>Number.EPSILON&&(J=!0):Se<-Number.EPSILON?ze<-Number.EPSILON&&(J=!0):Math.sign(We)===Math.sign(I)&&(J=!0),J?(se=-We,ve=Se,he=Math.sqrt(b)):(se=Se,ve=We,he=Math.sqrt(b/2))}return new be(se/he,ve/he)}let de=[];for(let ce=0,oe=H.length,te=oe-1,se=ce+1;ce<oe;ce++,te++,se++)te===oe&&(te=0),se===oe&&(se=0),de[ce]=G(H[ce],H[te],H[se]);let pe=[],ye,Me=de.concat();for(let ce=0,oe=Y;ce<oe;ce++){let te=R[ce];ye=[];for(let se=0,ve=te.length,he=ve-1,Se=se+1;se<ve;se++,he++,Se++)he===ve&&(he=0),Se===ve&&(Se=0),ye[se]=G(te[se],te[he],te[Se]);pe.push(ye),Me=Me.concat(ye)}let Ee;if(m===0)Ee=Pi.triangulateShape(H,R);else{let ce=[],oe=[];for(let te=0;te<m;te++){let se=te/m,ve=p*Math.cos(se*Math.PI/2),he=_*Math.sin(se*Math.PI/2)+y;for(let Se=0,We=H.length;Se<We;Se++){let ze=V(H[Se],de[Se],he);Ne(ze.x,ze.y,-ve),se===0&&ce.push(ze)}for(let Se=0,We=Y;Se<We;Se++){let ze=R[Se];ye=pe[Se];let I=[];for(let b=0,X=ze.length;b<X;b++){let J=V(ze[b],ye[b],he);Ne(J.x,J.y,-ve),se===0&&I.push(J)}se===0&&oe.push(I)}}Ee=Pi.triangulateShape(ce,oe)}let Ze=Ee.length,Ge=_+y;for(let ce=0;ce<j;ce++){let oe=f?V(v[ce],Me[ce],Ge):v[ce];g?(w.copy(C.normals[0]).multiplyScalar(oe.x),A.copy(C.binormals[0]).multiplyScalar(oe.y),P.copy(x[0]).add(w).add(A),Ne(P.x,P.y,P.z)):Ne(oe.x,oe.y,0)}for(let ce=1;ce<=h;ce++)for(let oe=0;oe<j;oe++){let te=f?V(v[oe],Me[oe],Ge):v[oe];g?(w.copy(C.normals[ce]).multiplyScalar(te.x),A.copy(C.binormals[ce]).multiplyScalar(te.y),P.copy(x[ce]).add(w).add(A),Ne(P.x,P.y,P.z)):Ne(te.x,te.y,u/h*ce)}for(let ce=m-1;ce>=0;ce--){let oe=ce/m,te=p*Math.cos(oe*Math.PI/2),se=_*Math.sin(oe*Math.PI/2)+y;for(let ve=0,he=H.length;ve<he;ve++){let Se=V(H[ve],de[ve],se);Ne(Se.x,Se.y,u+te)}for(let ve=0,he=R.length;ve<he;ve++){let Se=R[ve];ye=pe[ve];for(let We=0,ze=Se.length;We<ze;We++){let I=V(Se[We],ye[We],se);g?Ne(I.x,I.y+x[h-1].y,x[h-1].x+te):Ne(I.x,I.y,u+te)}}}ne(),re();function ne(){let ce=s.length/3;if(f){let oe=0,te=j*oe;for(let se=0;se<Ze;se++){let ve=Ee[se];Pe(ve[2]+te,ve[1]+te,ve[0]+te)}oe=h+m*2,te=j*oe;for(let se=0;se<Ze;se++){let ve=Ee[se];Pe(ve[0]+te,ve[1]+te,ve[2]+te)}}else{for(let oe=0;oe<Ze;oe++){let te=Ee[oe];Pe(te[2],te[1],te[0])}for(let oe=0;oe<Ze;oe++){let te=Ee[oe];Pe(te[0]+j*h,te[1]+j*h,te[2]+j*h)}}n.addGroup(ce,s.length/3-ce,0)}function re(){let ce=s.length/3,oe=0;Te(H,oe),oe+=H.length;for(let te=0,se=R.length;te<se;te++){let ve=R[te];Te(ve,oe),oe+=ve.length}n.addGroup(ce,s.length/3-ce,1)}function Te(ce,oe){let te=ce.length;for(;--te>=0;){let se=te,ve=te-1;ve<0&&(ve=ce.length-1);for(let he=0,Se=h+m*2;he<Se;he++){let We=j*he,ze=j*(he+1),I=oe+se+We,b=oe+ve+We,X=oe+ve+ze,J=oe+se+ze;Je(I,b,X,J)}}}function Ne(ce,oe,te){l.push(ce),l.push(oe),l.push(te)}function Pe(ce,oe,te){je(ce),je(oe),je(te);let se=s.length/3,ve=E.generateTopUV(n,s,se-3,se-2,se-1);O(ve[0]),O(ve[1]),O(ve[2])}function Je(ce,oe,te,se){je(ce),je(oe),je(se),je(oe),je(te),je(se);let ve=s.length/3,he=E.generateSideWallUV(n,s,ve-6,ve-3,ve-2,ve-1);O(he[0]),O(he[1]),O(he[3]),O(he[1]),O(he[2]),O(he[3])}function je(ce){s.push(l[ce*3+0]),s.push(l[ce*3+1]),s.push(l[ce*3+2])}function O(ce){r.push(ce.x),r.push(ce.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return np(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Ho[s.type]().fromJSON(s)),new i(n,e.options)}},tp={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new be(r,o),new be(a,l),new be(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],f=e[s*3],p=e[s*3+1],_=e[s*3+2],y=e[r*3],m=e[r*3+1],d=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new be(o,1-l),new be(c,1-u),new be(f,1-_),new be(y,1-d)]:[new be(a,1-l),new be(h,1-u),new be(p,1-_),new be(m,1-d)]}};function np(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Oi=class i extends st{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,f=t/l,p=[],_=[],y=[],m=[];for(let d=0;d<h;d++){let E=d*f-o;for(let x=0;x<c;x++){let g=x*u-r;_.push(g,-E,0),y.push(0,0,1),m.push(x/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let E=0;E<a;E++){let x=E+c*d,g=E+c*(d+1),C=E+1+c*(d+1),A=E+1+c*d;p.push(x,g,A),p.push(g,C,A)}this.setIndex(p),this.setAttribute("position",new ut(_,3)),this.setAttribute("normal",new ut(y,3)),this.setAttribute("uv",new ut(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var St=class i extends st{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new F,f=new F,p=[],_=[],y=[],m=[];for(let d=0;d<=n;d++){let E=[],x=d/n,g=0;d===0&&o===0?g=.5/t:d===n&&l===Math.PI&&(g=-.5/t);for(let C=0;C<=t;C++){let A=C/t;u.x=-e*Math.cos(s+A*r)*Math.sin(o+x*a),u.y=e*Math.cos(o+x*a),u.z=e*Math.sin(s+A*r)*Math.sin(o+x*a),_.push(u.x,u.y,u.z),f.copy(u).normalize(),y.push(f.x,f.y,f.z),m.push(A+g,1-x),E.push(c++)}h.push(E)}for(let d=0;d<n;d++)for(let E=0;E<t;E++){let x=h[d][E+1],g=h[d][E],C=h[d+1][E],A=h[d+1][E+1];(d!==0||o>0)&&p.push(x,g,A),(d!==n-1||l<Math.PI)&&p.push(g,C,A)}this.setIndex(p),this.setAttribute("position",new ut(_,3)),this.setAttribute("normal",new ut(y,3)),this.setAttribute("uv",new ut(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var En=class i extends st{constructor(e=new vr(new F(-1,-1,0),new F(-1,1,0),new F(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new F,l=new F,c=new be,h=new F,u=[],f=[],p=[],_=[];y(),this.setIndex(_),this.setAttribute("position",new ut(u,3)),this.setAttribute("normal",new ut(f,3)),this.setAttribute("uv",new ut(p,2));function y(){for(let x=0;x<t;x++)m(x);m(r===!1?t:0),E(),d()}function m(x){h=e.getPointAt(x/t,h);let g=o.normals[x],C=o.binormals[x];for(let A=0;A<=s;A++){let w=A/s*Math.PI*2,P=Math.sin(w),S=-Math.cos(w);l.x=S*g.x+P*C.x,l.y=S*g.y+P*C.y,l.z=S*g.z+P*C.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let x=1;x<=t;x++)for(let g=1;g<=s;g++){let C=(s+1)*(x-1)+(g-1),A=(s+1)*x+(g-1),w=(s+1)*x+g,P=(s+1)*(x-1)+g;_.push(C,A,P),_.push(A,w,P)}}function E(){for(let x=0;x<=t;x++)for(let g=0;g<=s;g++)c.x=x/t,c.y=g/s,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Ho[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Yt=class extends On{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ja,this.normalScale=new be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ar=class extends On{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ja,this.normalScale=new be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bn,this.combine=ca,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},gi=class extends On{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Su,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Go=class extends On{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Mo(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ip(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Bi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Wo=class extends Bi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Kl,endingEnd:Kl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case jl:r=e,a=2*t-n;break;case Ql:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case jl:o=e,l=2*n-t;break;case Ql:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,p=this._weightNext,_=(n-t)/(s-t),y=_*_,m=y*_,d=-f*m+2*f*y-f*_,E=(1+f)*m+(-1.5-2*f)*y+(-.5+f)*_+1,x=(-1-p)*m+(1.5+p)*y+.5*_,g=p*m-p*y;for(let C=0;C!==a;++C)r[C]=d*o[h+C]+E*o[c+C]+x*o[l+C]+g*o[u+C];return r}},Xo=class extends Bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(s-t),u=1-h;for(let f=0;f!==a;++f)r[f]=o[c+f]*u+o[l+f]*h;return r}},qo=class extends Bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},fn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Mo(t,this.TimeBufferType),this.values=Mo(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Mo(e.times,Array),values:Mo(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new qo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Xo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Wo(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case nr:t=this.InterpolantFactoryMethodDiscrete;break;case Ro:t=this.InterpolantFactoryMethodLinear;break;case bo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return nr;case this.InterpolantFactoryMethodLinear:return Ro;case this.InterpolantFactoryMethodSmooth:return bo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&ip(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===bo,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,f=u-n,p=u+n;for(let _=0;_!==n;++_){let y=t[u+_];if(y!==t[f+_]||y!==t[p+_]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,f=o*n;for(let p=0;p!==n;++p)t[f+p]=t[u+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};fn.prototype.ValueTypeName="";fn.prototype.TimeBufferType=Float32Array;fn.prototype.ValueBufferType=Float32Array;fn.prototype.DefaultInterpolation=Ro;var _i=class extends fn{constructor(e,t,n){super(e,t,n)}};_i.prototype.ValueTypeName="bool";_i.prototype.ValueBufferType=Array;_i.prototype.DefaultInterpolation=nr;_i.prototype.InterpolantFactoryMethodLinear=void 0;_i.prototype.InterpolantFactoryMethodSmooth=void 0;var Yo=class extends fn{constructor(e,t,n,s){super(e,t,n,s)}};Yo.prototype.ValueTypeName="color";var Zo=class extends fn{constructor(e,t,n,s){super(e,t,n,s)}};Zo.prototype.ValueTypeName="number";var Jo=class extends Bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)Ot.slerpFlat(r,0,o,c-a,o,c,l);return r}},Rr=class extends fn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Jo(this.times,this.values,this.getValueSize(),e)}};Rr.prototype.ValueTypeName="quaternion";Rr.prototype.InterpolantFactoryMethodSmooth=void 0;var xi=class extends fn{constructor(e,t,n){super(e,t,n)}};xi.prototype.ValueTypeName="string";xi.prototype.ValueBufferType=Array;xi.prototype.DefaultInterpolation=nr;xi.prototype.InterpolantFactoryMethodLinear=void 0;xi.prototype.InterpolantFactoryMethodSmooth=void 0;var $o=class extends fn{constructor(e,t,n,s){super(e,t,n,s)}};$o.prototype.ValueTypeName="vector";var Ko=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let p=c[u],_=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},ku=new Ko,jo=class{constructor(e){this.manager=e!==void 0?e:ku,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};jo.DEFAULT_MATERIAL_NAME="__DEFAULT";var vs=class extends At{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Cr=class extends vs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Zl=new Qe,Gh=new F,Wh=new F,Qo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new be(512,512),this.mapType=Un,this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new gs,this._frameExtents=new be(1,1),this._viewportCount=1,this._viewports=[new ot(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Gh.setFromMatrixPosition(e.matrixWorld),t.position.copy(Gh),Wh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Wh),t.updateMatrixWorld(),Zl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Zl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Xh=new Qe,js=new F,Jl=new F,rc=class extends Qo{constructor(){super(new Ft(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new be(4,2),this._viewportCount=6,this._viewports=[new ot(2,1,1,1),new ot(0,1,1,1),new ot(3,1,1,1),new ot(1,1,1,1),new ot(3,0,1,1),new ot(1,0,1,1)],this._cubeDirections=[new F(1,0,0),new F(-1,0,0),new F(0,0,1),new F(0,0,-1),new F(0,1,0),new F(0,-1,0)],this._cubeUps=[new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,0,1),new F(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),js.setFromMatrixPosition(e.matrixWorld),n.position.copy(js),Jl.copy(n.position),Jl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Jl),n.updateMatrixWorld(),s.makeTranslation(-js.x,-js.y,-js.z),Xh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Xh,n.coordinateSystem,n.reversedDepth)}},Ir=class extends vs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new rc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Kn=class extends cr{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},oc=class extends Qo{constructor(){super(new Kn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Pr=class extends vs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new oc}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var ea=class extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var wc="\\[\\]\\.:\\/",sp=new RegExp("["+wc+"]","g"),Tc="[^"+wc+"]",rp="[^"+wc.replace("\\.","")+"]",op=/((?:WC+[\/:])*)/.source.replace("WC",Tc),ap=/(WCOD+)?/.source.replace("WCOD",rp),lp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Tc),cp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Tc),hp=new RegExp("^"+op+ap+lp+cp+"$"),up=["material","materials","bones","map"],ac=class{constructor(e,t,n){let s=n||mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},mt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(sp,"")}static parseTrackName(e){let t=hp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);up.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};mt.Composite=ac;mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};mt.prototype.GetterByBindingType=[mt.prototype._getValue_direct,mt.prototype._getValue_array,mt.prototype._getValue_arrayElement,mt.prototype._getValue_toArray];mt.prototype.SetterByBindingTypeAndVersioning=[[mt.prototype._setValue_direct,mt.prototype._setValue_direct_setNeedsUpdate,mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_array,mt.prototype._setValue_array_setNeedsUpdate,mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_arrayElement,mt.prototype._setValue_arrayElement_setNeedsUpdate,mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[mt.prototype._setValue_fromArray,mt.prototype._setValue_fromArray_setNeedsUpdate,mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var $x=new Float32Array(1);var qh=new F,So,$l,Lr=class extends At{constructor(e=new F(0,0,1),t=new F(0,0,0),n=1,s=16776960,r=n*.2,o=r*.2){super(),this.type="ArrowHelper",So===void 0&&(So=new st,So.setAttribute("position",new ut([0,0,0,0,1,0],3)),$l=new Oo(.5,1,5,1),$l.translate(0,-.5,0)),this.position.copy(t),this.line=new Ni(So,new $n({color:s,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Ke($l,new nn({color:s,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{qh.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(qh,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}};function Ac(i,e,t,n){let s=dp(n);switch(t){case _c:return i*e;case _a:return i*e/s.components*s.byteLength;case xa:return i*e/s.components*s.byteLength;case yc:return i*e*2/s.components*s.byteLength;case ya:return i*e*2/s.components*s.byteLength;case xc:return i*e*3/s.components*s.byteLength;case sn:return i*e*4/s.components*s.byteLength;case va:return i*e*4/s.components*s.byteLength;case Fr:case Or:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Br:case kr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sa:case Ea:return Math.max(i,16)*Math.max(e,8)/4;case Ma:case ba:return Math.max(i,8)*Math.max(e,8)/2;case wa:case Ta:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Aa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ra:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ca:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ia:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Pa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case La:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Da:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ua:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Na:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Fa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Oa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ba:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ka:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case za:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ha:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Va:case Ga:case Wa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Xa:case qa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Ya:case Za:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function dp(i){switch(i){case Un:case fc:return{byteLength:1,components:1};case Ms:case pc:case Ss:return{byteLength:2,components:1};case ma:case ga:return{byteLength:2,components:4};case vi:case pa:case pn:return{byteLength:4,components:1};case mc:case gc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function cd(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function pp(i){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,_)=>p.start-_.start);let f=0;for(let p=1;p<u.length;p++){let _=u[f],y=u[p];y.start<=_.start+_.count+1?_.count=Math.max(_.count,y.start+y.count-_.start):(++f,u[f]=y)}u.length=f+1;for(let p=0,_=u.length;p<_;p++){let y=u[p];i.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var mp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,gp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,_p=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,xp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,yp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,vp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Mp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Sp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,bp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ep=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,wp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Tp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ap=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Rp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Cp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Lp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Dp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Up=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Np=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Fp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Op=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Bp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,kp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,zp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Hp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Vp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Gp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Wp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Xp="gl_FragColor = linearToOutputTexel( gl_FragColor );",qp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Yp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Jp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Kp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,jp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Qp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,em=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,nm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,im=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,sm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,rm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,om=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,am=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,lm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,cm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,um=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,dm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,fm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,pm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,mm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,gm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,_m=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,xm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ym=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Mm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Sm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,bm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Em=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,wm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Tm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Am=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Rm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Im=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Pm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Dm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Um=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Om=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Bm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,km=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Wm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Xm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ym=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$m=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Km=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,jm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Qm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,eg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,tg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ng=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ig=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,sg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,rg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,og=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ag=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,lg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,cg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,hg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ug=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,dg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,fg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,pg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,mg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_g=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,yg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Mg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Sg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,bg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Eg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,wg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ag=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Rg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Cg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ig=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Lg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Dg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ug=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Ng=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Fg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Og=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,kg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Hg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Gg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Wg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Yg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$e={alphahash_fragment:mp,alphahash_pars_fragment:gp,alphamap_fragment:_p,alphamap_pars_fragment:xp,alphatest_fragment:yp,alphatest_pars_fragment:vp,aomap_fragment:Mp,aomap_pars_fragment:Sp,batching_pars_vertex:bp,batching_vertex:Ep,begin_vertex:wp,beginnormal_vertex:Tp,bsdfs:Ap,iridescence_fragment:Rp,bumpmap_pars_fragment:Cp,clipping_planes_fragment:Ip,clipping_planes_pars_fragment:Pp,clipping_planes_pars_vertex:Lp,clipping_planes_vertex:Dp,color_fragment:Up,color_pars_fragment:Np,color_pars_vertex:Fp,color_vertex:Op,common:Bp,cube_uv_reflection_fragment:kp,defaultnormal_vertex:zp,displacementmap_pars_vertex:Hp,displacementmap_vertex:Vp,emissivemap_fragment:Gp,emissivemap_pars_fragment:Wp,colorspace_fragment:Xp,colorspace_pars_fragment:qp,envmap_fragment:Yp,envmap_common_pars_fragment:Zp,envmap_pars_fragment:Jp,envmap_pars_vertex:$p,envmap_physical_pars_fragment:am,envmap_vertex:Kp,fog_vertex:jp,fog_pars_vertex:Qp,fog_fragment:em,fog_pars_fragment:tm,gradientmap_pars_fragment:nm,lightmap_pars_fragment:im,lights_lambert_fragment:sm,lights_lambert_pars_fragment:rm,lights_pars_begin:om,lights_toon_fragment:lm,lights_toon_pars_fragment:cm,lights_phong_fragment:hm,lights_phong_pars_fragment:um,lights_physical_fragment:dm,lights_physical_pars_fragment:fm,lights_fragment_begin:pm,lights_fragment_maps:mm,lights_fragment_end:gm,logdepthbuf_fragment:_m,logdepthbuf_pars_fragment:xm,logdepthbuf_pars_vertex:ym,logdepthbuf_vertex:vm,map_fragment:Mm,map_pars_fragment:Sm,map_particle_fragment:bm,map_particle_pars_fragment:Em,metalnessmap_fragment:wm,metalnessmap_pars_fragment:Tm,morphinstance_vertex:Am,morphcolor_vertex:Rm,morphnormal_vertex:Cm,morphtarget_pars_vertex:Im,morphtarget_vertex:Pm,normal_fragment_begin:Lm,normal_fragment_maps:Dm,normal_pars_fragment:Um,normal_pars_vertex:Nm,normal_vertex:Fm,normalmap_pars_fragment:Om,clearcoat_normal_fragment_begin:Bm,clearcoat_normal_fragment_maps:km,clearcoat_pars_fragment:zm,iridescence_pars_fragment:Hm,opaque_fragment:Vm,packing:Gm,premultiplied_alpha_fragment:Wm,project_vertex:Xm,dithering_fragment:qm,dithering_pars_fragment:Ym,roughnessmap_fragment:Zm,roughnessmap_pars_fragment:Jm,shadowmap_pars_fragment:$m,shadowmap_pars_vertex:Km,shadowmap_vertex:jm,shadowmask_pars_fragment:Qm,skinbase_vertex:eg,skinning_pars_vertex:tg,skinning_vertex:ng,skinnormal_vertex:ig,specularmap_fragment:sg,specularmap_pars_fragment:rg,tonemapping_fragment:og,tonemapping_pars_fragment:ag,transmission_fragment:lg,transmission_pars_fragment:cg,uv_pars_fragment:hg,uv_pars_vertex:ug,uv_vertex:dg,worldpos_vertex:fg,background_vert:pg,background_frag:mg,backgroundCube_vert:gg,backgroundCube_frag:_g,cube_vert:xg,cube_frag:yg,depth_vert:vg,depth_frag:Mg,distanceRGBA_vert:Sg,distanceRGBA_frag:bg,equirect_vert:Eg,equirect_frag:wg,linedashed_vert:Tg,linedashed_frag:Ag,meshbasic_vert:Rg,meshbasic_frag:Cg,meshlambert_vert:Ig,meshlambert_frag:Pg,meshmatcap_vert:Lg,meshmatcap_frag:Dg,meshnormal_vert:Ug,meshnormal_frag:Ng,meshphong_vert:Fg,meshphong_frag:Og,meshphysical_vert:Bg,meshphysical_frag:kg,meshtoon_vert:zg,meshtoon_frag:Hg,points_vert:Vg,points_frag:Gg,shadow_vert:Wg,shadow_frag:Xg,sprite_vert:qg,sprite_frag:Yg},we={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},zn={basic:{uniforms:Gt([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:Gt([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Ve(0)}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:Gt([we.common,we.specularmap,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.fog,we.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:Gt([we.common,we.envmap,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.roughnessmap,we.metalnessmap,we.fog,we.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:Gt([we.common,we.aomap,we.lightmap,we.emissivemap,we.bumpmap,we.normalmap,we.displacementmap,we.gradientmap,we.fog,we.lights,{emissive:{value:new Ve(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:Gt([we.common,we.bumpmap,we.normalmap,we.displacementmap,we.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:Gt([we.points,we.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:Gt([we.common,we.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:Gt([we.common,we.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:Gt([we.common,we.bumpmap,we.normalmap,we.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:Gt([we.sprite,we.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distanceRGBA:{uniforms:Gt([we.common,we.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distanceRGBA_vert,fragmentShader:$e.distanceRGBA_frag},shadow:{uniforms:Gt([we.lights,we.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};zn.physical={uniforms:Gt([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var $a={r:0,b:0,g:0},Vi=new bn,Zg=new Qe;function Jg(i,e,t,n,s,r,o){let a=new Ve(0),l=r===!0?0:1,c,h,u=null,f=0,p=null;function _(x){let g=x.isScene===!0?x.background:null;return g&&g.isTexture&&(g=(x.backgroundBlurriness>0?t:e).get(g)),g}function y(x){let g=!1,C=_(x);C===null?d(a,l):C&&C.isColor&&(d(C,1),g=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||g)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,g){let C=_(g);C&&(C.isCubeTexture||C.mapping===Ur)?(h===void 0&&(h=new Ke(new Bn(1,1,1),new Dn({name:"BackgroundCubeMaterial",uniforms:Hi(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:Rt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,w,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Vi.copy(g.backgroundRotation),Vi.x*=-1,Vi.y*=-1,Vi.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(Vi.y*=-1,Vi.z*=-1),h.material.uniforms.envMap.value=C,h.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Zg.makeRotationFromEuler(Vi)),h.material.toneMapped=nt.getTransfer(C.colorSpace)!==at,(u!==C||f!==C.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=C,f=C.version,p=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):C&&C.isTexture&&(c===void 0&&(c=new Ke(new Oi(2,2),new Dn({name:"BackgroundMaterial",uniforms:Hi(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=C,c.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,c.material.toneMapped=nt.getTransfer(C.colorSpace)!==at,C.matrixAutoUpdate===!0&&C.updateMatrix(),c.material.uniforms.uvTransform.value.copy(C.matrix),(u!==C||f!==C.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=C,f=C.version,p=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function d(x,g){x.getRGB($a,bc(i)),n.buffers.color.setClear($a.r,$a.g,$a.b,g,o)}function E(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,g=1){a.set(x),l=g,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,d(a,l)},render:y,addToRenderList:m,dispose:E}}function $g(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(v,R,L,z,Y){let H=!1,V=u(z,L,R);r!==V&&(r=V,c(r.object)),H=p(v,z,L,Y),H&&_(v,z,L,Y),Y!==null&&e.update(Y,i.ELEMENT_ARRAY_BUFFER),(H||o)&&(o=!1,g(v,R,L,z),Y!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(Y).buffer))}function l(){return i.createVertexArray()}function c(v){return i.bindVertexArray(v)}function h(v){return i.deleteVertexArray(v)}function u(v,R,L){let z=L.wireframe===!0,Y=n[v.id];Y===void 0&&(Y={},n[v.id]=Y);let H=Y[R.id];H===void 0&&(H={},Y[R.id]=H);let V=H[z];return V===void 0&&(V=f(l()),H[z]=V),V}function f(v){let R=[],L=[],z=[];for(let Y=0;Y<t;Y++)R[Y]=0,L[Y]=0,z[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:L,attributeDivisors:z,object:v,attributes:{},index:null}}function p(v,R,L,z){let Y=r.attributes,H=R.attributes,V=0,j=L.getAttributes();for(let G in j)if(j[G].location>=0){let pe=Y[G],ye=H[G];if(ye===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(ye=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(ye=v.instanceColor)),pe===void 0||pe.attribute!==ye||ye&&pe.data!==ye.data)return!0;V++}return r.attributesNum!==V||r.index!==z}function _(v,R,L,z){let Y={},H=R.attributes,V=0,j=L.getAttributes();for(let G in j)if(j[G].location>=0){let pe=H[G];pe===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(pe=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(pe=v.instanceColor));let ye={};ye.attribute=pe,pe&&pe.data&&(ye.data=pe.data),Y[G]=ye,V++}r.attributes=Y,r.attributesNum=V,r.index=z}function y(){let v=r.newAttributes;for(let R=0,L=v.length;R<L;R++)v[R]=0}function m(v){d(v,0)}function d(v,R){let L=r.newAttributes,z=r.enabledAttributes,Y=r.attributeDivisors;L[v]=1,z[v]===0&&(i.enableVertexAttribArray(v),z[v]=1),Y[v]!==R&&(i.vertexAttribDivisor(v,R),Y[v]=R)}function E(){let v=r.newAttributes,R=r.enabledAttributes;for(let L=0,z=R.length;L<z;L++)R[L]!==v[L]&&(i.disableVertexAttribArray(L),R[L]=0)}function x(v,R,L,z,Y,H,V){V===!0?i.vertexAttribIPointer(v,R,L,Y,H):i.vertexAttribPointer(v,R,L,z,Y,H)}function g(v,R,L,z){y();let Y=z.attributes,H=L.getAttributes(),V=R.defaultAttributeValues;for(let j in H){let G=H[j];if(G.location>=0){let de=Y[j];if(de===void 0&&(j==="instanceMatrix"&&v.instanceMatrix&&(de=v.instanceMatrix),j==="instanceColor"&&v.instanceColor&&(de=v.instanceColor)),de!==void 0){let pe=de.normalized,ye=de.itemSize,Me=e.get(de);if(Me===void 0)continue;let Ee=Me.buffer,Ze=Me.type,Ge=Me.bytesPerElement,ne=Ze===i.INT||Ze===i.UNSIGNED_INT||de.gpuType===pa;if(de.isInterleavedBufferAttribute){let re=de.data,Te=re.stride,Ne=de.offset;if(re.isInstancedInterleavedBuffer){for(let Pe=0;Pe<G.locationSize;Pe++)d(G.location+Pe,re.meshPerAttribute);v.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Pe=0;Pe<G.locationSize;Pe++)m(G.location+Pe);i.bindBuffer(i.ARRAY_BUFFER,Ee);for(let Pe=0;Pe<G.locationSize;Pe++)x(G.location+Pe,ye/G.locationSize,Ze,pe,Te*Ge,(Ne+ye/G.locationSize*Pe)*Ge,ne)}else{if(de.isInstancedBufferAttribute){for(let re=0;re<G.locationSize;re++)d(G.location+re,de.meshPerAttribute);v.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let re=0;re<G.locationSize;re++)m(G.location+re);i.bindBuffer(i.ARRAY_BUFFER,Ee);for(let re=0;re<G.locationSize;re++)x(G.location+re,ye/G.locationSize,Ze,pe,ye*Ge,ye/G.locationSize*re*Ge,ne)}}else if(V!==void 0){let pe=V[j];if(pe!==void 0)switch(pe.length){case 2:i.vertexAttrib2fv(G.location,pe);break;case 3:i.vertexAttrib3fv(G.location,pe);break;case 4:i.vertexAttrib4fv(G.location,pe);break;default:i.vertexAttrib1fv(G.location,pe)}}}}E()}function C(){P();for(let v in n){let R=n[v];for(let L in R){let z=R[L];for(let Y in z)h(z[Y].object),delete z[Y];delete R[L]}delete n[v]}}function A(v){if(n[v.id]===void 0)return;let R=n[v.id];for(let L in R){let z=R[L];for(let Y in z)h(z[Y].object),delete z[Y];delete R[L]}delete n[v.id]}function w(v){for(let R in n){let L=n[R];if(L[v.id]===void 0)continue;let z=L[v.id];for(let Y in z)h(z[Y].object),delete z[Y];delete L[v.id]}}function P(){S(),o=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:P,resetDefaultState:S,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:m,disableUnusedAttributes:E}}function Kg(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let _=0;_<u;_++)p+=h[_];t.update(p,n,1)}function l(c,h,u,f){if(u===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<c.length;_++)o(c[_],h[_],f[_]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let _=0;for(let y=0;y<u;y++)_+=h[y]*f[y];t.update(_,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function jg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==sn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){let P=w===Ss&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Un&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==pn&&!P)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),x=i.getParameter(i.MAX_VARYING_VECTORS),g=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=_>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:_,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:E,maxVaryings:x,maxFragmentUniforms:g,vertexTextures:C,maxSamples:A}}function Qg(i){let e=this,t=null,n=0,s=!1,r=!1,o=new Fn,a=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,p){let _=u.clippingPlanes,y=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||_===null||_.length===0||r&&!m)r?h(null):c();else{let E=r?0:n,x=E*4,g=d.clippingState||null;l.value=g,g=h(_,f,x,p);for(let C=0;C!==x;++C)g[C]=t[C];d.clippingState=g,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,p,_){let y=u!==null?u.length:0,m=null;if(y!==0){if(m=l.value,_!==!0||m===null){let d=p+y*4,E=f.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<d)&&(m=new Float32Array(d));for(let x=0,g=p;x!==y;++x,g+=4)o.copy(u[x]).applyMatrix4(E,a),o.normal.toArray(m,g),m[g+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function e0(i){let e=new WeakMap;function t(o,a){return a===ua?o.mapping=ki:a===da&&(o.mapping=zi),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ua||a===da)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Uo(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Cs=4,zu=[.125,.215,.35,.446,.526,.582],Xi=20,Rc=new Kn,Hu=new Ve,Cc=null,Ic=0,Pc=0,Lc=!1,Wi=(1+Math.sqrt(5))/2,Rs=1/Wi,Vu=[new F(-Wi,Rs,0),new F(Wi,Rs,0),new F(-Rs,0,Wi),new F(Rs,0,Wi),new F(0,Wi,-Rs),new F(0,Wi,Rs),new F(-1,1,-1),new F(1,1,-1),new F(-1,1,1),new F(1,1,1)],t0=new F,Ps=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=t0}=r;Cc=this._renderer.getRenderTarget(),Ic=this._renderer.getActiveCubeFace(),Pc=this._renderer.getActiveMipmapLevel(),Lc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Xu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Wu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Cc,Ic,Pc),this._renderer.xr.enabled=Lc,e.scissorTest=!1,Ka(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ki||e.mapping===zi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Cc=this._renderer.getRenderTarget(),Ic=this._renderer.getActiveCubeFace(),Pc=this._renderer.getActiveMipmapLevel(),Lc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:en,minFilter:en,generateMipmaps:!1,type:Ss,format:sn,colorSpace:Ui,depthBuffer:!1},s=Gu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gu(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=n0(r)),this._blurMaterial=i0(r,e,t)}return s}_compileMaterial(e){let t=new Ke(this._lodPlanes[0],e);this._renderer.compile(t,Rc)}_sceneToCubeUV(e,t,n,s,r){let l=new Ft(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(Hu),u.toneMapping=Qn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));let y=new nn({name:"PMREM.Background",side:Rt,depthWrite:!1,depthTest:!1}),m=new Ke(new Bn,y),d=!1,E=e.background;E?E.isColor&&(y.color.copy(E),e.background=null,d=!0):(y.color.copy(Hu),d=!0);for(let x=0;x<6;x++){let g=x%3;g===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[x],r.y,r.z)):g===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[x]));let C=this._cubeSize;Ka(s,g*C,x>2?C:0,C,C),u.setRenderTarget(s),d&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=f,e.background=E}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ki||e.mapping===zi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Xu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Wu());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ke(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Ka(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Rc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Vu[(s-r-1)%Vu.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new Ke(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Xi-1),y=r/_,m=isFinite(r)?1+Math.floor(h*y):Xi;m>Xi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Xi}`);let d=[],E=0;for(let w=0;w<Xi;++w){let P=w/y,S=Math.exp(-P*P/2);d.push(S),w===0?E+=S:w<m&&(E+=2*S)}for(let w=0;w<d.length;w++)d[w]=d[w]/E;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:x}=this;f.dTheta.value=_,f.mipInt.value=x-n;let g=this._sizeLods[s],C=3*g*(s>x-Cs?s-x+Cs:0),A=4*(this._cubeSize-g);Ka(t,C,A,3*g,2*g),l.setRenderTarget(t),l.render(u,Rc)}};function n0(i){let e=[],t=[],n=[],s=i,r=i-Cs+1+zu.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Cs?l=zu[o-i+Cs-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,_=6,y=3,m=2,d=1,E=new Float32Array(y*_*p),x=new Float32Array(m*_*p),g=new Float32Array(d*_*p);for(let A=0;A<p;A++){let w=A%3*2/3-1,P=A>2?0:-1,S=[w,P,0,w+2/3,P,0,w+2/3,P+1,0,w,P,0,w+2/3,P+1,0,w,P+1,0];E.set(S,y*_*A),x.set(f,m*_*A);let v=[A,A,A,A,A,A];g.set(v,d*_*A)}let C=new st;C.setAttribute("position",new qe(E,y)),C.setAttribute("uv",new qe(x,m)),C.setAttribute("faceIndex",new qe(g,d)),e.push(C),s>Cs&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Gu(i,e,t){let n=new Sn(i,e,t);return n.texture.mapping=Ur,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ka(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function i0(i,e,t){let n=new Float32Array(Xi),s=new F(0,1,0);return new Dn({name:"SphericalGaussianBlur",defines:{n:Xi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Vc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Wu(){return new Dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Vc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Xu(){return new Dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Vc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Vc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function s0(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===ua||l===da,h=l===ki||l===zi;if(c||h){let u=e.get(a),f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Ps(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let p=a.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new Ps(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function r0(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&fs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function o0(i,e,t,n){let s={},r=new WeakMap;function o(u){let f=u.target;f.index!==null&&e.remove(f.index);for(let _ in f.attributes)e.remove(f.attributes[_]);f.removeEventListener("dispose",o),delete s[f.id];let p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(u){let f=u.attributes;for(let p in f)e.update(f[p],i.ARRAY_BUFFER)}function c(u){let f=[],p=u.index,_=u.attributes.position,y=0;if(p!==null){let E=p.array;y=p.version;for(let x=0,g=E.length;x<g;x+=3){let C=E[x+0],A=E[x+1],w=E[x+2];f.push(C,A,A,w,w,C)}}else if(_!==void 0){let E=_.array;y=_.version;for(let x=0,g=E.length/3-1;x<g;x+=3){let C=x+0,A=x+1,w=x+2;f.push(C,A,A,w,w,C)}}else return;let m=new(Sc(f)?pi:fi)(f,1);m.version=y;let d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){let f=r.get(u);if(f){let p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function a0(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*o),t.update(p,n,1)}function c(f,p,_){_!==0&&(i.drawElementsInstanced(n,p,r,f*o,_),t.update(p,n,_))}function h(f,p,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,_);let m=0;for(let d=0;d<_;d++)m+=p[d];t.update(m,n,1)}function u(f,p,_,y){if(_===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/o,p[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,y,0,_);let d=0;for(let E=0;E<_;E++)d+=p[E]*y[E];t.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function l0(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function c0(i,e,t){let n=new WeakMap,s=new ot;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,f=n.get(a);if(f===void 0||f.count!==u){let S=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",S)};f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],E=a.morphAttributes.color||[],x=0;p===!0&&(x=1),_===!0&&(x=2),y===!0&&(x=3);let g=a.attributes.position.count*x,C=1;g>e.maxTextureSize&&(C=Math.ceil(g/e.maxTextureSize),g=e.maxTextureSize);let A=new Float32Array(g*C*4*u),w=new or(A,g,C,u);w.type=pn,w.needsUpdate=!0;let P=x*4;for(let v=0;v<u;v++){let R=m[v],L=d[v],z=E[v],Y=g*C*4*v;for(let H=0;H<R.count;H++){let V=H*P;p===!0&&(s.fromBufferAttribute(R,H),A[Y+V+0]=s.x,A[Y+V+1]=s.y,A[Y+V+2]=s.z,A[Y+V+3]=0),_===!0&&(s.fromBufferAttribute(L,H),A[Y+V+4]=s.x,A[Y+V+5]=s.y,A[Y+V+6]=s.z,A[Y+V+7]=0),y===!0&&(s.fromBufferAttribute(z,H),A[Y+V+8]=s.x,A[Y+V+9]=s.y,A[Y+V+10]=s.z,A[Y+V+11]=z.itemSize===4?s.w:1)}}f={count:u,texture:w,size:new be(g,C)},n.set(a,f),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];let _=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function h0(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var hd=new qt,qu=new mr(1,1),ud=new or,dd=new Lo,fd=new hr,Yu=[],Zu=[],Ju=new Float32Array(16),$u=new Float32Array(9),Ku=new Float32Array(4);function Ls(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Yu[s];if(r===void 0&&(r=new Float32Array(s),Yu[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Pt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Lt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Qa(i,e){let t=Zu[e];t===void 0&&(t=new Int32Array(e),Zu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function u0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function d0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2fv(this.addr,e),Lt(t,e)}}function f0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Pt(t,e))return;i.uniform3fv(this.addr,e),Lt(t,e)}}function p0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4fv(this.addr,e),Lt(t,e)}}function m0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Ku.set(n),i.uniformMatrix2fv(this.addr,!1,Ku),Lt(t,n)}}function g0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;$u.set(n),i.uniformMatrix3fv(this.addr,!1,$u),Lt(t,n)}}function _0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Ju.set(n),i.uniformMatrix4fv(this.addr,!1,Ju),Lt(t,n)}}function x0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function y0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2iv(this.addr,e),Lt(t,e)}}function v0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3iv(this.addr,e),Lt(t,e)}}function M0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4iv(this.addr,e),Lt(t,e)}}function S0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function b0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2uiv(this.addr,e),Lt(t,e)}}function E0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3uiv(this.addr,e),Lt(t,e)}}function w0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4uiv(this.addr,e),Lt(t,e)}}function T0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(qu.compareFunction=vc,r=qu):r=hd,t.setTexture2D(e||r,s)}function A0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||dd,s)}function R0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||fd,s)}function C0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||ud,s)}function I0(i){switch(i){case 5126:return u0;case 35664:return d0;case 35665:return f0;case 35666:return p0;case 35674:return m0;case 35675:return g0;case 35676:return _0;case 5124:case 35670:return x0;case 35667:case 35671:return y0;case 35668:case 35672:return v0;case 35669:case 35673:return M0;case 5125:return S0;case 36294:return b0;case 36295:return E0;case 36296:return w0;case 35678:case 36198:case 36298:case 36306:case 35682:return T0;case 35679:case 36299:case 36307:return A0;case 35680:case 36300:case 36308:case 36293:return R0;case 36289:case 36303:case 36311:case 36292:return C0}}function P0(i,e){i.uniform1fv(this.addr,e)}function L0(i,e){let t=Ls(e,this.size,2);i.uniform2fv(this.addr,t)}function D0(i,e){let t=Ls(e,this.size,3);i.uniform3fv(this.addr,t)}function U0(i,e){let t=Ls(e,this.size,4);i.uniform4fv(this.addr,t)}function N0(i,e){let t=Ls(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function F0(i,e){let t=Ls(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function O0(i,e){let t=Ls(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function B0(i,e){i.uniform1iv(this.addr,e)}function k0(i,e){i.uniform2iv(this.addr,e)}function z0(i,e){i.uniform3iv(this.addr,e)}function H0(i,e){i.uniform4iv(this.addr,e)}function V0(i,e){i.uniform1uiv(this.addr,e)}function G0(i,e){i.uniform2uiv(this.addr,e)}function W0(i,e){i.uniform3uiv(this.addr,e)}function X0(i,e){i.uniform4uiv(this.addr,e)}function q0(i,e,t){let n=this.cache,s=e.length,r=Qa(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||hd,r[o])}function Y0(i,e,t){let n=this.cache,s=e.length,r=Qa(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||dd,r[o])}function Z0(i,e,t){let n=this.cache,s=e.length,r=Qa(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||fd,r[o])}function J0(i,e,t){let n=this.cache,s=e.length,r=Qa(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||ud,r[o])}function $0(i){switch(i){case 5126:return P0;case 35664:return L0;case 35665:return D0;case 35666:return U0;case 35674:return N0;case 35675:return F0;case 35676:return O0;case 5124:case 35670:return B0;case 35667:case 35671:return k0;case 35668:case 35672:return z0;case 35669:case 35673:return H0;case 5125:return V0;case 36294:return G0;case 36295:return W0;case 36296:return X0;case 35678:case 36198:case 36298:case 36306:case 35682:return q0;case 35679:case 36299:case 36307:return Y0;case 35680:case 36300:case 36308:case 36293:return Z0;case 36289:case 36303:case 36311:case 36292:return J0}}var Uc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=I0(t.type)}},Nc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$0(t.type)}},Fc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Dc=/(\w+)(\])?(\[|\.)?/g;function ju(i,e){i.seq.push(e),i.map[e.id]=e}function K0(i,e,t){let n=i.name,s=n.length;for(Dc.lastIndex=0;;){let r=Dc.exec(n),o=Dc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){ju(t,c===void 0?new Uc(a,i,e):new Nc(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Fc(a),ju(t,u)),t=u}}}var Is=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);K0(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Qu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var j0=37297,Q0=0;function e_(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var ed=new Ye;function t_(i){nt._getMatrix(ed,nt.workingColorSpace,i);let e=`mat3( ${ed.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(i)){case ir:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function td(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+e_(i.getShaderSource(e),a)}else return r}function n_(i,e){let t=t_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function i_(i,e){let t;switch(e){case mu:t="Linear";break;case gu:t="Reinhard";break;case _u:t="Cineon";break;case xu:t="ACESFilmic";break;case vu:t="AgX";break;case ha:t="Neutral";break;case yu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ja=new F;function s_(){nt.getLuminanceCoefficients(ja);let i=ja.x.toFixed(4),e=ja.y.toFixed(4),t=ja.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function r_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(zr).join(`
`)}function o_(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function a_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function zr(i){return i!==""}function nd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function id(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var l_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Oc(i){return i.replace(l_,h_)}var c_=new Map;function h_(i,e){let t=$e[e];if(t===void 0){let n=c_.get(e);if(n!==void 0)t=$e[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Oc(t)}var u_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function sd(i){return i.replace(u_,d_)}function d_(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function rd(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function f_(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Dr?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===ta?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===kn&&(e="SHADOWMAP_TYPE_VSM"),e}function p_(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ki:case zi:e="ENVMAP_TYPE_CUBE";break;case Ur:e="ENVMAP_TYPE_CUBE_UV";break}return e}function m_(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case zi:e="ENVMAP_MODE_REFRACTION";break}return e}function g_(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case ca:e="ENVMAP_BLENDING_MULTIPLY";break;case fu:e="ENVMAP_BLENDING_MIX";break;case pu:e="ENVMAP_BLENDING_ADD";break}return e}function __(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function x_(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=f_(t),c=p_(t),h=m_(t),u=g_(t),f=__(t),p=r_(t),_=o_(r),y=s.createProgram(),m,d,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(zr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(zr).join(`
`),d.length>0&&(d+=`
`)):(m=[rd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(zr).join(`
`),d=[rd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Qn?"#define TONE_MAPPING":"",t.toneMapping!==Qn?$e.tonemapping_pars_fragment:"",t.toneMapping!==Qn?i_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,n_("linearToOutputTexel",t.outputColorSpace),s_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(zr).join(`
`)),o=Oc(o),o=nd(o,t),o=id(o,t),a=Oc(a),a=nd(a,t),a=id(a,t),o=sd(o),a=sd(a),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===Mc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Mc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let x=E+m+o,g=E+d+a,C=Qu(s,s.VERTEX_SHADER,x),A=Qu(s,s.FRAGMENT_SHADER,g);s.attachShader(y,C),s.attachShader(y,A),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function w(R){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y)||"",z=s.getShaderInfoLog(C)||"",Y=s.getShaderInfoLog(A)||"",H=L.trim(),V=z.trim(),j=Y.trim(),G=!0,de=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,C,A);else{let pe=td(s,C,"vertex"),ye=td(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+H+`
`+pe+`
`+ye)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(V===""||j==="")&&(de=!1);de&&(R.diagnostics={runnable:G,programLog:H,vertexShader:{log:V,prefix:m},fragmentShader:{log:j,prefix:d}})}s.deleteShader(C),s.deleteShader(A),P=new Is(s,y),S=a_(s,y)}let P;this.getUniforms=function(){return P===void 0&&w(this),P};let S;this.getAttributes=function(){return S===void 0&&w(this),S};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(y,j0)),v},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Q0++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=C,this.fragmentShader=A,this}var y_=0,Bc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new kc(e),t.set(e,n)),n}},kc=class{constructor(e){this.id=y_++,this.code=e,this.usedTimes=0}};function v_(i,e,t,n,s,r,o){let a=new lr,l=new Bc,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,v,R,L,z){let Y=L.fog,H=z.geometry,V=S.isMeshStandardMaterial?L.environment:null,j=(S.isMeshStandardMaterial?t:e).get(S.envMap||V),G=j&&j.mapping===Ur?j.image.height:null,de=_[S.type];S.precision!==null&&(p=s.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));let pe=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,ye=pe!==void 0?pe.length:0,Me=0;H.morphAttributes.position!==void 0&&(Me=1),H.morphAttributes.normal!==void 0&&(Me=2),H.morphAttributes.color!==void 0&&(Me=3);let Ee,Ze,Ge,ne;if(de){let me=zn[de];Ee=me.vertexShader,Ze=me.fragmentShader}else Ee=S.vertexShader,Ze=S.fragmentShader,l.update(S),Ge=l.getVertexShaderID(S),ne=l.getFragmentShaderID(S);let re=i.getRenderTarget(),Te=i.state.buffers.depth.getReversed(),Ne=z.isInstancedMesh===!0,Pe=z.isBatchedMesh===!0,Je=!!S.map,je=!!S.matcap,O=!!j,ce=!!S.aoMap,oe=!!S.lightMap,te=!!S.bumpMap,se=!!S.normalMap,ve=!!S.displacementMap,he=!!S.emissiveMap,Se=!!S.metalnessMap,We=!!S.roughnessMap,ze=S.anisotropy>0,I=S.clearcoat>0,b=S.dispersion>0,X=S.iridescence>0,J=S.sheen>0,ue=S.transmission>0,Q=ze&&!!S.anisotropyMap,Ue=I&&!!S.clearcoatMap,xe=I&&!!S.clearcoatNormalMap,Ie=I&&!!S.clearcoatRoughnessMap,Le=X&&!!S.iridescenceMap,M=X&&!!S.iridescenceThicknessMap,U=J&&!!S.sheenColorMap,k=J&&!!S.sheenRoughnessMap,D=!!S.specularMap,B=!!S.specularColorMap,le=!!S.specularIntensityMap,N=ue&&!!S.transmissionMap,$=ue&&!!S.thicknessMap,ee=!!S.gradientMap,ge=!!S.alphaMap,ae=S.alphaTest>0,ie=!!S.alphaHash,Ae=!!S.extensions,Re=Qn;S.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(Re=i.toneMapping);let fe={shaderID:de,shaderType:S.type,shaderName:S.name,vertexShader:Ee,fragmentShader:Ze,defines:S.defines,customVertexShaderID:Ge,customFragmentShaderID:ne,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:Pe,batchingColor:Pe&&z._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&z.instanceColor!==null,instancingMorph:Ne&&z.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:re===null?i.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:Ui,alphaToCoverage:!!S.alphaToCoverage,map:Je,matcap:je,envMap:O,envMapMode:O&&j.mapping,envMapCubeUVHeight:G,aoMap:ce,lightMap:oe,bumpMap:te,normalMap:se,displacementMap:f&&ve,emissiveMap:he,normalMapObjectSpace:se&&S.normalMapType===bu,normalMapTangentSpace:se&&S.normalMapType===Ja,metalnessMap:Se,roughnessMap:We,anisotropy:ze,anisotropyMap:Q,clearcoat:I,clearcoatMap:Ue,clearcoatNormalMap:xe,clearcoatRoughnessMap:Ie,dispersion:b,iridescence:X,iridescenceMap:Le,iridescenceThicknessMap:M,sheen:J,sheenColorMap:U,sheenRoughnessMap:k,specularMap:D,specularColorMap:B,specularIntensityMap:le,transmission:ue,transmissionMap:N,thicknessMap:$,gradientMap:ee,opaque:S.transparent===!1&&S.blending===Li&&S.alphaToCoverage===!1,alphaMap:ge,alphaTest:ae,alphaHash:ie,combine:S.combine,mapUv:Je&&y(S.map.channel),aoMapUv:ce&&y(S.aoMap.channel),lightMapUv:oe&&y(S.lightMap.channel),bumpMapUv:te&&y(S.bumpMap.channel),normalMapUv:se&&y(S.normalMap.channel),displacementMapUv:ve&&y(S.displacementMap.channel),emissiveMapUv:he&&y(S.emissiveMap.channel),metalnessMapUv:Se&&y(S.metalnessMap.channel),roughnessMapUv:We&&y(S.roughnessMap.channel),anisotropyMapUv:Q&&y(S.anisotropyMap.channel),clearcoatMapUv:Ue&&y(S.clearcoatMap.channel),clearcoatNormalMapUv:xe&&y(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ie&&y(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Le&&y(S.iridescenceMap.channel),iridescenceThicknessMapUv:M&&y(S.iridescenceThicknessMap.channel),sheenColorMapUv:U&&y(S.sheenColorMap.channel),sheenRoughnessMapUv:k&&y(S.sheenRoughnessMap.channel),specularMapUv:D&&y(S.specularMap.channel),specularColorMapUv:B&&y(S.specularColorMap.channel),specularIntensityMapUv:le&&y(S.specularIntensityMap.channel),transmissionMapUv:N&&y(S.transmissionMap.channel),thicknessMapUv:$&&y(S.thicknessMap.channel),alphaMapUv:ge&&y(S.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(se||ze),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!H.attributes.uv&&(Je||ge),fog:!!Y,useFog:S.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:Te,skinning:z.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:ye,morphTextureStride:Me,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:Re,decodeVideoTexture:Je&&S.map.isVideoTexture===!0&&nt.getTransfer(S.map.colorSpace)===at,decodeVideoTextureEmissive:he&&S.emissiveMap.isVideoTexture===!0&&nt.getTransfer(S.emissiveMap.colorSpace)===at,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Bt,flipSided:S.side===Rt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ae&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ae&&S.extensions.multiDraw===!0||Pe)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return fe.vertexUv1s=c.has(1),fe.vertexUv2s=c.has(2),fe.vertexUv3s=c.has(3),c.clear(),fe}function d(S){let v=[];if(S.shaderID?v.push(S.shaderID):(v.push(S.customVertexShaderID),v.push(S.customFragmentShaderID)),S.defines!==void 0)for(let R in S.defines)v.push(R),v.push(S.defines[R]);return S.isRawShaderMaterial===!1&&(E(v,S),x(v,S),v.push(i.outputColorSpace)),v.push(S.customProgramCacheKey),v.join()}function E(S,v){S.push(v.precision),S.push(v.outputColorSpace),S.push(v.envMapMode),S.push(v.envMapCubeUVHeight),S.push(v.mapUv),S.push(v.alphaMapUv),S.push(v.lightMapUv),S.push(v.aoMapUv),S.push(v.bumpMapUv),S.push(v.normalMapUv),S.push(v.displacementMapUv),S.push(v.emissiveMapUv),S.push(v.metalnessMapUv),S.push(v.roughnessMapUv),S.push(v.anisotropyMapUv),S.push(v.clearcoatMapUv),S.push(v.clearcoatNormalMapUv),S.push(v.clearcoatRoughnessMapUv),S.push(v.iridescenceMapUv),S.push(v.iridescenceThicknessMapUv),S.push(v.sheenColorMapUv),S.push(v.sheenRoughnessMapUv),S.push(v.specularMapUv),S.push(v.specularColorMapUv),S.push(v.specularIntensityMapUv),S.push(v.transmissionMapUv),S.push(v.thicknessMapUv),S.push(v.combine),S.push(v.fogExp2),S.push(v.sizeAttenuation),S.push(v.morphTargetsCount),S.push(v.morphAttributeCount),S.push(v.numDirLights),S.push(v.numPointLights),S.push(v.numSpotLights),S.push(v.numSpotLightMaps),S.push(v.numHemiLights),S.push(v.numRectAreaLights),S.push(v.numDirLightShadows),S.push(v.numPointLightShadows),S.push(v.numSpotLightShadows),S.push(v.numSpotLightShadowsWithMaps),S.push(v.numLightProbes),S.push(v.shadowMapType),S.push(v.toneMapping),S.push(v.numClippingPlanes),S.push(v.numClipIntersection),S.push(v.depthPacking)}function x(S,v){a.disableAll(),v.supportsVertexTextures&&a.enable(0),v.instancing&&a.enable(1),v.instancingColor&&a.enable(2),v.instancingMorph&&a.enable(3),v.matcap&&a.enable(4),v.envMap&&a.enable(5),v.normalMapObjectSpace&&a.enable(6),v.normalMapTangentSpace&&a.enable(7),v.clearcoat&&a.enable(8),v.iridescence&&a.enable(9),v.alphaTest&&a.enable(10),v.vertexColors&&a.enable(11),v.vertexAlphas&&a.enable(12),v.vertexUv1s&&a.enable(13),v.vertexUv2s&&a.enable(14),v.vertexUv3s&&a.enable(15),v.vertexTangents&&a.enable(16),v.anisotropy&&a.enable(17),v.alphaHash&&a.enable(18),v.batching&&a.enable(19),v.dispersion&&a.enable(20),v.batchingColor&&a.enable(21),v.gradientMap&&a.enable(22),S.push(a.mask),a.disableAll(),v.fog&&a.enable(0),v.useFog&&a.enable(1),v.flatShading&&a.enable(2),v.logarithmicDepthBuffer&&a.enable(3),v.reversedDepthBuffer&&a.enable(4),v.skinning&&a.enable(5),v.morphTargets&&a.enable(6),v.morphNormals&&a.enable(7),v.morphColors&&a.enable(8),v.premultipliedAlpha&&a.enable(9),v.shadowMapEnabled&&a.enable(10),v.doubleSided&&a.enable(11),v.flipSided&&a.enable(12),v.useDepthPacking&&a.enable(13),v.dithering&&a.enable(14),v.transmission&&a.enable(15),v.sheen&&a.enable(16),v.opaque&&a.enable(17),v.pointsUvs&&a.enable(18),v.decodeVideoTexture&&a.enable(19),v.decodeVideoTextureEmissive&&a.enable(20),v.alphaToCoverage&&a.enable(21),S.push(a.mask)}function g(S){let v=_[S.type],R;if(v){let L=zn[v];R=Uu.clone(L.uniforms)}else R=S.uniforms;return R}function C(S,v){let R;for(let L=0,z=h.length;L<z;L++){let Y=h[L];if(Y.cacheKey===v){R=Y,++R.usedTimes;break}}return R===void 0&&(R=new x_(i,v,S,r),h.push(R)),R}function A(S){if(--S.usedTimes===0){let v=h.indexOf(S);h[v]=h[h.length-1],h.pop(),S.destroy()}}function w(S){l.remove(S)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:g,acquireProgram:C,releaseProgram:A,releaseShaderCache:w,programs:h,dispose:P}}function M_(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function S_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function od(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ad(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,f,p,_,y,m){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:_,renderOrder:u.renderOrder,z:y,group:m},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=_,d.renderOrder=u.renderOrder,d.z=y,d.group=m),e++,d}function a(u,f,p,_,y,m){let d=o(u,f,p,_,y,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function l(u,f,p,_,y,m){let d=o(u,f,p,_,y,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,f){t.length>1&&t.sort(u||S_),n.length>1&&n.sort(f||od),s.length>1&&s.sort(f||od)}function h(){for(let u=e,f=i.length;u<f;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function b_(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new ad,i.set(n,[o])):s>=r.length?(o=new ad,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function E_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new F,color:new Ve};break;case"SpotLight":t={position:new F,direction:new F,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new F,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new F,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new F,halfWidth:new F,halfHeight:new F};break}return i[e.id]=t,t}}}function w_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var T_=0;function A_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function R_(i){let e=new E_,t=w_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new F);let s=new F,r=new Qe,o=new Qe;function a(c){let h=0,u=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,_=0,y=0,m=0,d=0,E=0,x=0,g=0,C=0,A=0,w=0;c.sort(A_);for(let S=0,v=c.length;S<v;S++){let R=c[S],L=R.color,z=R.intensity,Y=R.distance,H=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)h+=L.r*z,u+=L.g*z,f+=L.b*z;else if(R.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(R.sh.coefficients[V],z);w++}else if(R.isDirectionalLight){let V=e.get(R);if(V.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let j=R.shadow,G=t.get(R);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,n.directionalShadow[p]=G,n.directionalShadowMap[p]=H,n.directionalShadowMatrix[p]=R.shadow.matrix,E++}n.directional[p]=V,p++}else if(R.isSpotLight){let V=e.get(R);V.position.setFromMatrixPosition(R.matrixWorld),V.color.copy(L).multiplyScalar(z),V.distance=Y,V.coneCos=Math.cos(R.angle),V.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),V.decay=R.decay,n.spot[y]=V;let j=R.shadow;if(R.map&&(n.spotLightMap[C]=R.map,C++,j.updateMatrices(R),R.castShadow&&A++),n.spotLightMatrix[y]=j.matrix,R.castShadow){let G=t.get(R);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,n.spotShadow[y]=G,n.spotShadowMap[y]=H,g++}y++}else if(R.isRectAreaLight){let V=e.get(R);V.color.copy(L).multiplyScalar(z),V.halfWidth.set(R.width*.5,0,0),V.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=V,m++}else if(R.isPointLight){let V=e.get(R);if(V.color.copy(R.color).multiplyScalar(R.intensity),V.distance=R.distance,V.decay=R.decay,R.castShadow){let j=R.shadow,G=t.get(R);G.shadowIntensity=j.intensity,G.shadowBias=j.bias,G.shadowNormalBias=j.normalBias,G.shadowRadius=j.radius,G.shadowMapSize=j.mapSize,G.shadowCameraNear=j.camera.near,G.shadowCameraFar=j.camera.far,n.pointShadow[_]=G,n.pointShadowMap[_]=H,n.pointShadowMatrix[_]=R.shadow.matrix,x++}n.point[_]=V,_++}else if(R.isHemisphereLight){let V=e.get(R);V.skyColor.copy(R.color).multiplyScalar(z),V.groundColor.copy(R.groundColor).multiplyScalar(z),n.hemi[d]=V,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=we.LTC_FLOAT_1,n.rectAreaLTC2=we.LTC_FLOAT_2):(n.rectAreaLTC1=we.LTC_HALF_1,n.rectAreaLTC2=we.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;let P=n.hash;(P.directionalLength!==p||P.pointLength!==_||P.spotLength!==y||P.rectAreaLength!==m||P.hemiLength!==d||P.numDirectionalShadows!==E||P.numPointShadows!==x||P.numSpotShadows!==g||P.numSpotMaps!==C||P.numLightProbes!==w)&&(n.directional.length=p,n.spot.length=y,n.rectArea.length=m,n.point.length=_,n.hemi.length=d,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=g,n.spotShadowMap.length=g,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=g+C-A,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=w,P.directionalLength=p,P.pointLength=_,P.spotLength=y,P.rectAreaLength=m,P.hemiLength=d,P.numDirectionalShadows=E,P.numPointShadows=x,P.numSpotShadows=g,P.numSpotMaps=C,P.numLightProbes=w,n.version=T_++)}function l(c,h){let u=0,f=0,p=0,_=0,y=0,m=h.matrixWorldInverse;for(let d=0,E=c.length;d<E;d++){let x=c[d];if(x.isDirectionalLight){let g=n.directional[u];g.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),g.direction.sub(s),g.direction.transformDirection(m),u++}else if(x.isSpotLight){let g=n.spot[p];g.position.setFromMatrixPosition(x.matrixWorld),g.position.applyMatrix4(m),g.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),g.direction.sub(s),g.direction.transformDirection(m),p++}else if(x.isRectAreaLight){let g=n.rectArea[_];g.position.setFromMatrixPosition(x.matrixWorld),g.position.applyMatrix4(m),o.identity(),r.copy(x.matrixWorld),r.premultiply(m),o.extractRotation(r),g.halfWidth.set(x.width*.5,0,0),g.halfHeight.set(0,x.height*.5,0),g.halfWidth.applyMatrix4(o),g.halfHeight.applyMatrix4(o),_++}else if(x.isPointLight){let g=n.point[f];g.position.setFromMatrixPosition(x.matrixWorld),g.position.applyMatrix4(m),f++}else if(x.isHemisphereLight){let g=n.hemi[y];g.direction.setFromMatrixPosition(x.matrixWorld),g.direction.transformDirection(m),y++}}}return{setup:a,setupView:l,state:n}}function ld(i){let e=new R_(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function C_(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new ld(i),e.set(s,[a])):r>=o.length?(a=new ld(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var I_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,P_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function L_(i,e,t){let n=new gs,s=new be,r=new be,o=new ot,a=new gi({depthPacking:ws}),l=new Go,c={},h=t.maxTextureSize,u={[Qt]:Rt,[Rt]:Qt,[Bt]:Bt},f=new Dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new be},radius:{value:4}},vertexShader:I_,fragmentShader:P_}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let _=new st;_.setAttribute("position",new qe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Ke(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Dr;let d=this.type;this.render=function(A,w,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let S=i.getRenderTarget(),v=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),L=i.state;L.setBlending(jn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let z=d!==kn&&this.type===kn,Y=d===kn&&this.type!==kn;for(let H=0,V=A.length;H<V;H++){let j=A[H],G=j.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let de=G.getFrameExtents();if(s.multiply(de),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/de.x),s.x=r.x*de.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/de.y),s.y=r.y*de.y,G.mapSize.y=r.y)),G.map===null||z===!0||Y===!0){let ye=this.type!==kn?{minFilter:Vt,magFilter:Vt}:{};G.map!==null&&G.map.dispose(),G.map=new Sn(s.x,s.y,ye),G.map.texture.name=j.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let pe=G.getViewportCount();for(let ye=0;ye<pe;ye++){let Me=G.getViewport(ye);o.set(r.x*Me.x,r.y*Me.y,r.x*Me.z,r.y*Me.w),L.viewport(o),G.updateMatrices(j,ye),n=G.getFrustum(),g(w,P,G.camera,j,this.type)}G.isPointLightShadow!==!0&&this.type===kn&&E(G,P),G.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(S,v,R)};function E(A,w){let P=e.update(y);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Sn(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(w,null,P,f,y,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(w,null,P,p,y,null)}function x(A,w,P,S){let v=null,R=P.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(R!==void 0)v=R;else if(v=P.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let L=v.uuid,z=w.uuid,Y=c[L];Y===void 0&&(Y={},c[L]=Y);let H=Y[z];H===void 0&&(H=v.clone(),Y[z]=H,w.addEventListener("dispose",C)),v=H}if(v.visible=w.visible,v.wireframe=w.wireframe,S===kn?v.side=w.shadowSide!==null?w.shadowSide:w.side:v.side=w.shadowSide!==null?w.shadowSide:u[w.side],v.alphaMap=w.alphaMap,v.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,v.map=w.map,v.clipShadows=w.clipShadows,v.clippingPlanes=w.clippingPlanes,v.clipIntersection=w.clipIntersection,v.displacementMap=w.displacementMap,v.displacementScale=w.displacementScale,v.displacementBias=w.displacementBias,v.wireframeLinewidth=w.wireframeLinewidth,v.linewidth=w.linewidth,P.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let L=i.properties.get(v);L.light=P}return v}function g(A,w,P,S,v){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&v===kn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,A.matrixWorld);let z=e.update(A),Y=A.material;if(Array.isArray(Y)){let H=z.groups;for(let V=0,j=H.length;V<j;V++){let G=H[V],de=Y[G.materialIndex];if(de&&de.visible){let pe=x(A,de,S,v);A.onBeforeShadow(i,A,w,P,z,pe,G),i.renderBufferDirect(P,null,z,pe,A,G),A.onAfterShadow(i,A,w,P,z,pe,G)}}}else if(Y.visible){let H=x(A,Y,S,v);A.onBeforeShadow(i,A,w,P,z,H,null),i.renderBufferDirect(P,null,z,H,A,null),A.onAfterShadow(i,A,w,P,z,H,null)}}let L=A.children;for(let z=0,Y=L.length;z<Y;z++)g(L[z],w,P,S,v)}function C(A){A.target.removeEventListener("dispose",C);for(let P in c){let S=c[P],v=A.target.uuid;v in S&&(S[v].dispose(),delete S[v])}}}var D_={[na]:ia,[sa]:aa,[ra]:la,[Di]:oa,[ia]:na,[aa]:sa,[la]:ra,[oa]:Di};function U_(i,e){function t(){let N=!1,$=new ot,ee=null,ge=new ot(0,0,0,0);return{setMask:function(ae){ee!==ae&&!N&&(i.colorMask(ae,ae,ae,ae),ee=ae)},setLocked:function(ae){N=ae},setClear:function(ae,ie,Ae,Re,fe){fe===!0&&(ae*=Re,ie*=Re,Ae*=Re),$.set(ae,ie,Ae,Re),ge.equals($)===!1&&(i.clearColor(ae,ie,Ae,Re),ge.copy($))},reset:function(){N=!1,ee=null,ge.set(-1,0,0,0)}}}function n(){let N=!1,$=!1,ee=null,ge=null,ae=null;return{setReversed:function(ie){if($!==ie){let Ae=e.get("EXT_clip_control");ie?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),$=ie;let Re=ae;ae=null,this.setClear(Re)}},getReversed:function(){return $},setTest:function(ie){ie?re(i.DEPTH_TEST):Te(i.DEPTH_TEST)},setMask:function(ie){ee!==ie&&!N&&(i.depthMask(ie),ee=ie)},setFunc:function(ie){if($&&(ie=D_[ie]),ge!==ie){switch(ie){case na:i.depthFunc(i.NEVER);break;case ia:i.depthFunc(i.ALWAYS);break;case sa:i.depthFunc(i.LESS);break;case Di:i.depthFunc(i.LEQUAL);break;case ra:i.depthFunc(i.EQUAL);break;case oa:i.depthFunc(i.GEQUAL);break;case aa:i.depthFunc(i.GREATER);break;case la:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ge=ie}},setLocked:function(ie){N=ie},setClear:function(ie){ae!==ie&&($&&(ie=1-ie),i.clearDepth(ie),ae=ie)},reset:function(){N=!1,ee=null,ge=null,ae=null,$=!1}}}function s(){let N=!1,$=null,ee=null,ge=null,ae=null,ie=null,Ae=null,Re=null,fe=null;return{setTest:function(me){N||(me?re(i.STENCIL_TEST):Te(i.STENCIL_TEST))},setMask:function(me){$!==me&&!N&&(i.stencilMask(me),$=me)},setFunc:function(me,Oe,lt){(ee!==me||ge!==Oe||ae!==lt)&&(i.stencilFunc(me,Oe,lt),ee=me,ge=Oe,ae=lt)},setOp:function(me,Oe,lt){(ie!==me||Ae!==Oe||Re!==lt)&&(i.stencilOp(me,Oe,lt),ie=me,Ae=Oe,Re=lt)},setLocked:function(me){N=me},setClear:function(me){fe!==me&&(i.clearStencil(me),fe=me)},reset:function(){N=!1,$=null,ee=null,ge=null,ae=null,ie=null,Ae=null,Re=null,fe=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,p=[],_=null,y=!1,m=null,d=null,E=null,x=null,g=null,C=null,A=null,w=new Ve(0,0,0),P=0,S=!1,v=null,R=null,L=null,z=null,Y=null,H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,j=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(G)[1]),V=j>=1):G.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),V=j>=2);let de=null,pe={},ye=i.getParameter(i.SCISSOR_BOX),Me=i.getParameter(i.VIEWPORT),Ee=new ot().fromArray(ye),Ze=new ot().fromArray(Me);function Ge(N,$,ee,ge){let ae=new Uint8Array(4),ie=i.createTexture();i.bindTexture(N,ie),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ae=0;Ae<ee;Ae++)N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY?i.texImage3D($,0,i.RGBA,1,1,ge,0,i.RGBA,i.UNSIGNED_BYTE,ae):i.texImage2D($+Ae,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ae);return ie}let ne={};ne[i.TEXTURE_2D]=Ge(i.TEXTURE_2D,i.TEXTURE_2D,1),ne[i.TEXTURE_CUBE_MAP]=Ge(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ne[i.TEXTURE_2D_ARRAY]=Ge(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ne[i.TEXTURE_3D]=Ge(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),re(i.DEPTH_TEST),o.setFunc(Di),te(!1),se(lc),re(i.CULL_FACE),ce(jn);function re(N){h[N]!==!0&&(i.enable(N),h[N]=!0)}function Te(N){h[N]!==!1&&(i.disable(N),h[N]=!1)}function Ne(N,$){return u[N]!==$?(i.bindFramebuffer(N,$),u[N]=$,N===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=$),N===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=$),!0):!1}function Pe(N,$){let ee=p,ge=!1;if(N){ee=f.get($),ee===void 0&&(ee=[],f.set($,ee));let ae=N.textures;if(ee.length!==ae.length||ee[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Ae=ae.length;ie<Ae;ie++)ee[ie]=i.COLOR_ATTACHMENT0+ie;ee.length=ae.length,ge=!0}}else ee[0]!==i.BACK&&(ee[0]=i.BACK,ge=!0);ge&&i.drawBuffers(ee)}function Je(N){return _!==N?(i.useProgram(N),_=N,!0):!1}let je={[di]:i.FUNC_ADD,[$h]:i.FUNC_SUBTRACT,[Kh]:i.FUNC_REVERSE_SUBTRACT};je[jh]=i.MIN,je[Qh]=i.MAX;let O={[eu]:i.ZERO,[tu]:i.ONE,[nu]:i.SRC_COLOR,[Eo]:i.SRC_ALPHA,[lu]:i.SRC_ALPHA_SATURATE,[ou]:i.DST_COLOR,[su]:i.DST_ALPHA,[iu]:i.ONE_MINUS_SRC_COLOR,[wo]:i.ONE_MINUS_SRC_ALPHA,[au]:i.ONE_MINUS_DST_COLOR,[ru]:i.ONE_MINUS_DST_ALPHA,[cu]:i.CONSTANT_COLOR,[hu]:i.ONE_MINUS_CONSTANT_COLOR,[uu]:i.CONSTANT_ALPHA,[du]:i.ONE_MINUS_CONSTANT_ALPHA};function ce(N,$,ee,ge,ae,ie,Ae,Re,fe,me){if(N===jn){y===!0&&(Te(i.BLEND),y=!1);return}if(y===!1&&(re(i.BLEND),y=!0),N!==Jh){if(N!==m||me!==S){if((d!==di||g!==di)&&(i.blendEquation(i.FUNC_ADD),d=di,g=di),me)switch(N){case Li:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case cc:i.blendFunc(i.ONE,i.ONE);break;case hc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case uc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case Li:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case cc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case hc:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case uc:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}E=null,x=null,C=null,A=null,w.set(0,0,0),P=0,m=N,S=me}return}ae=ae||$,ie=ie||ee,Ae=Ae||ge,($!==d||ae!==g)&&(i.blendEquationSeparate(je[$],je[ae]),d=$,g=ae),(ee!==E||ge!==x||ie!==C||Ae!==A)&&(i.blendFuncSeparate(O[ee],O[ge],O[ie],O[Ae]),E=ee,x=ge,C=ie,A=Ae),(Re.equals(w)===!1||fe!==P)&&(i.blendColor(Re.r,Re.g,Re.b,fe),w.copy(Re),P=fe),m=N,S=!1}function oe(N,$){N.side===Bt?Te(i.CULL_FACE):re(i.CULL_FACE);let ee=N.side===Rt;$&&(ee=!ee),te(ee),N.blending===Li&&N.transparent===!1?ce(jn):ce(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),o.setFunc(N.depthFunc),o.setTest(N.depthTest),o.setMask(N.depthWrite),r.setMask(N.colorWrite);let ge=N.stencilWrite;a.setTest(ge),ge&&(a.setMask(N.stencilWriteMask),a.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),a.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),he(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?re(i.SAMPLE_ALPHA_TO_COVERAGE):Te(i.SAMPLE_ALPHA_TO_COVERAGE)}function te(N){v!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),v=N)}function se(N){N!==Yh?(re(i.CULL_FACE),N!==R&&(N===lc?i.cullFace(i.BACK):N===Zh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Te(i.CULL_FACE),R=N}function ve(N){N!==L&&(V&&i.lineWidth(N),L=N)}function he(N,$,ee){N?(re(i.POLYGON_OFFSET_FILL),(z!==$||Y!==ee)&&(i.polygonOffset($,ee),z=$,Y=ee)):Te(i.POLYGON_OFFSET_FILL)}function Se(N){N?re(i.SCISSOR_TEST):Te(i.SCISSOR_TEST)}function We(N){N===void 0&&(N=i.TEXTURE0+H-1),de!==N&&(i.activeTexture(N),de=N)}function ze(N,$,ee){ee===void 0&&(de===null?ee=i.TEXTURE0+H-1:ee=de);let ge=pe[ee];ge===void 0&&(ge={type:void 0,texture:void 0},pe[ee]=ge),(ge.type!==N||ge.texture!==$)&&(de!==ee&&(i.activeTexture(ee),de=ee),i.bindTexture(N,$||ne[N]),ge.type=N,ge.texture=$)}function I(){let N=pe[de];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function b(){try{i.compressedTexImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function X(){try{i.compressedTexImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function J(){try{i.texSubImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ue(){try{i.texSubImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Q(){try{i.compressedTexSubImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ue(){try{i.compressedTexSubImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function xe(){try{i.texStorage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ie(){try{i.texStorage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Le(){try{i.texImage2D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function M(){try{i.texImage3D(...arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function U(N){Ee.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),Ee.copy(N))}function k(N){Ze.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),Ze.copy(N))}function D(N,$){let ee=c.get($);ee===void 0&&(ee=new WeakMap,c.set($,ee));let ge=ee.get(N);ge===void 0&&(ge=i.getUniformBlockIndex($,N.name),ee.set(N,ge))}function B(N,$){let ge=c.get($).get(N);l.get($)!==ge&&(i.uniformBlockBinding($,ge,N.__bindingPointIndex),l.set($,ge))}function le(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},de=null,pe={},u={},f=new WeakMap,p=[],_=null,y=!1,m=null,d=null,E=null,x=null,g=null,C=null,A=null,w=new Ve(0,0,0),P=0,S=!1,v=null,R=null,L=null,z=null,Y=null,Ee.set(0,0,i.canvas.width,i.canvas.height),Ze.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:re,disable:Te,bindFramebuffer:Ne,drawBuffers:Pe,useProgram:Je,setBlending:ce,setMaterial:oe,setFlipSided:te,setCullFace:se,setLineWidth:ve,setPolygonOffset:he,setScissorTest:Se,activeTexture:We,bindTexture:ze,unbindTexture:I,compressedTexImage2D:b,compressedTexImage3D:X,texImage2D:Le,texImage3D:M,updateUBOMapping:D,uniformBlockBinding:B,texStorage2D:xe,texStorage3D:Ie,texSubImage2D:J,texSubImage3D:ue,compressedTexSubImage2D:Q,compressedTexSubImage3D:Ue,scissor:U,viewport:k,reset:le}}function N_(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new be,h=new WeakMap,u,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(I,b){return p?new OffscreenCanvas(I,b):rr("canvas")}function y(I,b,X){let J=1,ue=ze(I);if((ue.width>X||ue.height>X)&&(J=X/Math.max(ue.width,ue.height)),J<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let Q=Math.floor(J*ue.width),Ue=Math.floor(J*ue.height);u===void 0&&(u=_(Q,Ue));let xe=b?_(Q,Ue):u;return xe.width=Q,xe.height=Ue,xe.getContext("2d").drawImage(I,0,0,Q,Ue),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ue.width+"x"+ue.height+") to ("+Q+"x"+Ue+")."),xe}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ue.width+"x"+ue.height+")."),I;return I}function m(I){return I.generateMipmaps}function d(I){i.generateMipmap(I)}function E(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function x(I,b,X,J,ue=!1){if(I!==null){if(i[I]!==void 0)return i[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let Q=b;if(b===i.RED&&(X===i.FLOAT&&(Q=i.R32F),X===i.HALF_FLOAT&&(Q=i.R16F),X===i.UNSIGNED_BYTE&&(Q=i.R8)),b===i.RED_INTEGER&&(X===i.UNSIGNED_BYTE&&(Q=i.R8UI),X===i.UNSIGNED_SHORT&&(Q=i.R16UI),X===i.UNSIGNED_INT&&(Q=i.R32UI),X===i.BYTE&&(Q=i.R8I),X===i.SHORT&&(Q=i.R16I),X===i.INT&&(Q=i.R32I)),b===i.RG&&(X===i.FLOAT&&(Q=i.RG32F),X===i.HALF_FLOAT&&(Q=i.RG16F),X===i.UNSIGNED_BYTE&&(Q=i.RG8)),b===i.RG_INTEGER&&(X===i.UNSIGNED_BYTE&&(Q=i.RG8UI),X===i.UNSIGNED_SHORT&&(Q=i.RG16UI),X===i.UNSIGNED_INT&&(Q=i.RG32UI),X===i.BYTE&&(Q=i.RG8I),X===i.SHORT&&(Q=i.RG16I),X===i.INT&&(Q=i.RG32I)),b===i.RGB_INTEGER&&(X===i.UNSIGNED_BYTE&&(Q=i.RGB8UI),X===i.UNSIGNED_SHORT&&(Q=i.RGB16UI),X===i.UNSIGNED_INT&&(Q=i.RGB32UI),X===i.BYTE&&(Q=i.RGB8I),X===i.SHORT&&(Q=i.RGB16I),X===i.INT&&(Q=i.RGB32I)),b===i.RGBA_INTEGER&&(X===i.UNSIGNED_BYTE&&(Q=i.RGBA8UI),X===i.UNSIGNED_SHORT&&(Q=i.RGBA16UI),X===i.UNSIGNED_INT&&(Q=i.RGBA32UI),X===i.BYTE&&(Q=i.RGBA8I),X===i.SHORT&&(Q=i.RGBA16I),X===i.INT&&(Q=i.RGBA32I)),b===i.RGB&&(X===i.UNSIGNED_INT_5_9_9_9_REV&&(Q=i.RGB9_E5),X===i.UNSIGNED_INT_10F_11F_11F_REV&&(Q=i.R11F_G11F_B10F)),b===i.RGBA){let Ue=ue?ir:nt.getTransfer(J);X===i.FLOAT&&(Q=i.RGBA32F),X===i.HALF_FLOAT&&(Q=i.RGBA16F),X===i.UNSIGNED_BYTE&&(Q=Ue===at?i.SRGB8_ALPHA8:i.RGBA8),X===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),X===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function g(I,b){let X;return I?b===null||b===vi||b===bs?X=i.DEPTH24_STENCIL8:b===pn?X=i.DEPTH32F_STENCIL8:b===Ms&&(X=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===vi||b===bs?X=i.DEPTH_COMPONENT24:b===pn?X=i.DEPTH_COMPONENT32F:b===Ms&&(X=i.DEPTH_COMPONENT16),X}function C(I,b){return m(I)===!0||I.isFramebufferTexture&&I.minFilter!==Vt&&I.minFilter!==en?Math.log2(Math.max(b.width,b.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?b.mipmaps.length:1}function A(I){let b=I.target;b.removeEventListener("dispose",A),P(b),b.isVideoTexture&&h.delete(b)}function w(I){let b=I.target;b.removeEventListener("dispose",w),v(b)}function P(I){let b=n.get(I);if(b.__webglInit===void 0)return;let X=I.source,J=f.get(X);if(J){let ue=J[b.__cacheKey];ue.usedTimes--,ue.usedTimes===0&&S(I),Object.keys(J).length===0&&f.delete(X)}n.remove(I)}function S(I){let b=n.get(I);i.deleteTexture(b.__webglTexture);let X=I.source,J=f.get(X);delete J[b.__cacheKey],o.memory.textures--}function v(I){let b=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(b.__webglFramebuffer[J]))for(let ue=0;ue<b.__webglFramebuffer[J].length;ue++)i.deleteFramebuffer(b.__webglFramebuffer[J][ue]);else i.deleteFramebuffer(b.__webglFramebuffer[J]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[J])}else{if(Array.isArray(b.__webglFramebuffer))for(let J=0;J<b.__webglFramebuffer.length;J++)i.deleteFramebuffer(b.__webglFramebuffer[J]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let J=0;J<b.__webglColorRenderbuffer.length;J++)b.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[J]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let X=I.textures;for(let J=0,ue=X.length;J<ue;J++){let Q=n.get(X[J]);Q.__webglTexture&&(i.deleteTexture(Q.__webglTexture),o.memory.textures--),n.remove(X[J])}n.remove(I)}let R=0;function L(){R=0}function z(){let I=R;return I>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+s.maxTextures),R+=1,I}function Y(I){let b=[];return b.push(I.wrapS),b.push(I.wrapT),b.push(I.wrapR||0),b.push(I.magFilter),b.push(I.minFilter),b.push(I.anisotropy),b.push(I.internalFormat),b.push(I.format),b.push(I.type),b.push(I.generateMipmaps),b.push(I.premultiplyAlpha),b.push(I.flipY),b.push(I.unpackAlignment),b.push(I.colorSpace),b.join()}function H(I,b){let X=n.get(I);if(I.isVideoTexture&&Se(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&X.__version!==I.version){let J=I.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ne(X,I,b);return}}else I.isExternalTexture&&(X.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,X.__webglTexture,i.TEXTURE0+b)}function V(I,b){let X=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&X.__version!==I.version){ne(X,I,b);return}t.bindTexture(i.TEXTURE_2D_ARRAY,X.__webglTexture,i.TEXTURE0+b)}function j(I,b){let X=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&X.__version!==I.version){ne(X,I,b);return}t.bindTexture(i.TEXTURE_3D,X.__webglTexture,i.TEXTURE0+b)}function G(I,b){let X=n.get(I);if(I.version>0&&X.__version!==I.version){re(X,I,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture,i.TEXTURE0+b)}let de={[To]:i.REPEAT,[ui]:i.CLAMP_TO_EDGE,[Ao]:i.MIRRORED_REPEAT},pe={[Vt]:i.NEAREST,[Mu]:i.NEAREST_MIPMAP_NEAREST,[Nr]:i.NEAREST_MIPMAP_LINEAR,[en]:i.LINEAR,[fa]:i.LINEAR_MIPMAP_NEAREST,[yi]:i.LINEAR_MIPMAP_LINEAR},ye={[Eu]:i.NEVER,[Iu]:i.ALWAYS,[wu]:i.LESS,[vc]:i.LEQUAL,[Tu]:i.EQUAL,[Cu]:i.GEQUAL,[Au]:i.GREATER,[Ru]:i.NOTEQUAL};function Me(I,b){if(b.type===pn&&e.has("OES_texture_float_linear")===!1&&(b.magFilter===en||b.magFilter===fa||b.magFilter===Nr||b.magFilter===yi||b.minFilter===en||b.minFilter===fa||b.minFilter===Nr||b.minFilter===yi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,de[b.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,de[b.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,de[b.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,pe[b.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,pe[b.minFilter]),b.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,ye[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Vt||b.minFilter!==Nr&&b.minFilter!==yi||b.type===pn&&e.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let X=e.get("EXT_texture_filter_anisotropic");i.texParameterf(I,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Ee(I,b){let X=!1;I.__webglInit===void 0&&(I.__webglInit=!0,b.addEventListener("dispose",A));let J=b.source,ue=f.get(J);ue===void 0&&(ue={},f.set(J,ue));let Q=Y(b);if(Q!==I.__cacheKey){ue[Q]===void 0&&(ue[Q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,X=!0),ue[Q].usedTimes++;let Ue=ue[I.__cacheKey];Ue!==void 0&&(ue[I.__cacheKey].usedTimes--,Ue.usedTimes===0&&S(b)),I.__cacheKey=Q,I.__webglTexture=ue[Q].texture}return X}function Ze(I,b,X){return Math.floor(Math.floor(I/X)/b)}function Ge(I,b,X,J){let Q=I.updateRanges;if(Q.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,X,J,b.data);else{Q.sort((M,U)=>M.start-U.start);let Ue=0;for(let M=1;M<Q.length;M++){let U=Q[Ue],k=Q[M],D=U.start+U.count,B=Ze(k.start,b.width,4),le=Ze(U.start,b.width,4);k.start<=D+1&&B===le&&Ze(k.start+k.count-1,b.width,4)===B?U.count=Math.max(U.count,k.start+k.count-U.start):(++Ue,Q[Ue]=k)}Q.length=Ue+1;let xe=i.getParameter(i.UNPACK_ROW_LENGTH),Ie=i.getParameter(i.UNPACK_SKIP_PIXELS),Le=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let M=0,U=Q.length;M<U;M++){let k=Q[M],D=Math.floor(k.start/4),B=Math.ceil(k.count/4),le=D%b.width,N=Math.floor(D/b.width),$=B,ee=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,le),i.pixelStorei(i.UNPACK_SKIP_ROWS,N),t.texSubImage2D(i.TEXTURE_2D,0,le,N,$,ee,X,J,b.data)}I.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,xe),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ie),i.pixelStorei(i.UNPACK_SKIP_ROWS,Le)}}function ne(I,b,X){let J=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(J=i.TEXTURE_3D);let ue=Ee(I,b),Q=b.source;t.bindTexture(J,I.__webglTexture,i.TEXTURE0+X);let Ue=n.get(Q);if(Q.version!==Ue.__version||ue===!0){t.activeTexture(i.TEXTURE0+X);let xe=nt.getPrimaries(nt.workingColorSpace),Ie=b.colorSpace===ei?null:nt.getPrimaries(b.colorSpace),Le=b.colorSpace===ei||xe===Ie?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le);let M=y(b.image,!1,s.maxTextureSize);M=We(b,M);let U=r.convert(b.format,b.colorSpace),k=r.convert(b.type),D=x(b.internalFormat,U,k,b.colorSpace,b.isVideoTexture);Me(J,b);let B,le=b.mipmaps,N=b.isVideoTexture!==!0,$=Ue.__version===void 0||ue===!0,ee=Q.dataReady,ge=C(b,M);if(b.isDepthTexture)D=g(b.format===Es,b.type),$&&(N?t.texStorage2D(i.TEXTURE_2D,1,D,M.width,M.height):t.texImage2D(i.TEXTURE_2D,0,D,M.width,M.height,0,U,k,null));else if(b.isDataTexture)if(le.length>0){N&&$&&t.texStorage2D(i.TEXTURE_2D,ge,D,le[0].width,le[0].height);for(let ae=0,ie=le.length;ae<ie;ae++)B=le[ae],N?ee&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,B.width,B.height,U,k,B.data):t.texImage2D(i.TEXTURE_2D,ae,D,B.width,B.height,0,U,k,B.data);b.generateMipmaps=!1}else N?($&&t.texStorage2D(i.TEXTURE_2D,ge,D,M.width,M.height),ee&&Ge(b,M,U,k)):t.texImage2D(i.TEXTURE_2D,0,D,M.width,M.height,0,U,k,M.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){N&&$&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,D,le[0].width,le[0].height,M.depth);for(let ae=0,ie=le.length;ae<ie;ae++)if(B=le[ae],b.format!==sn)if(U!==null)if(N){if(ee)if(b.layerUpdates.size>0){let Ae=Ac(B.width,B.height,b.format,b.type);for(let Re of b.layerUpdates){let fe=B.data.subarray(Re*Ae/B.data.BYTES_PER_ELEMENT,(Re+1)*Ae/B.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,Re,B.width,B.height,1,U,fe)}b.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,B.width,B.height,M.depth,U,B.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,D,B.width,B.height,M.depth,0,B.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else N?ee&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,B.width,B.height,M.depth,U,k,B.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,D,B.width,B.height,M.depth,0,U,k,B.data)}else{N&&$&&t.texStorage2D(i.TEXTURE_2D,ge,D,le[0].width,le[0].height);for(let ae=0,ie=le.length;ae<ie;ae++)B=le[ae],b.format!==sn?U!==null?N?ee&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,B.width,B.height,U,B.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,D,B.width,B.height,0,B.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):N?ee&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,B.width,B.height,U,k,B.data):t.texImage2D(i.TEXTURE_2D,ae,D,B.width,B.height,0,U,k,B.data)}else if(b.isDataArrayTexture)if(N){if($&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,D,M.width,M.height,M.depth),ee)if(b.layerUpdates.size>0){let ae=Ac(M.width,M.height,b.format,b.type);for(let ie of b.layerUpdates){let Ae=M.data.subarray(ie*ae/M.data.BYTES_PER_ELEMENT,(ie+1)*ae/M.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ie,M.width,M.height,1,U,k,Ae)}b.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,M.width,M.height,M.depth,U,k,M.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,D,M.width,M.height,M.depth,0,U,k,M.data);else if(b.isData3DTexture)N?($&&t.texStorage3D(i.TEXTURE_3D,ge,D,M.width,M.height,M.depth),ee&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,M.width,M.height,M.depth,U,k,M.data)):t.texImage3D(i.TEXTURE_3D,0,D,M.width,M.height,M.depth,0,U,k,M.data);else if(b.isFramebufferTexture){if($)if(N)t.texStorage2D(i.TEXTURE_2D,ge,D,M.width,M.height);else{let ae=M.width,ie=M.height;for(let Ae=0;Ae<ge;Ae++)t.texImage2D(i.TEXTURE_2D,Ae,D,ae,ie,0,U,k,null),ae>>=1,ie>>=1}}else if(le.length>0){if(N&&$){let ae=ze(le[0]);t.texStorage2D(i.TEXTURE_2D,ge,D,ae.width,ae.height)}for(let ae=0,ie=le.length;ae<ie;ae++)B=le[ae],N?ee&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,U,k,B):t.texImage2D(i.TEXTURE_2D,ae,D,U,k,B);b.generateMipmaps=!1}else if(N){if($){let ae=ze(M);t.texStorage2D(i.TEXTURE_2D,ge,D,ae.width,ae.height)}ee&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,U,k,M)}else t.texImage2D(i.TEXTURE_2D,0,D,U,k,M);m(b)&&d(J),Ue.__version=Q.version,b.onUpdate&&b.onUpdate(b)}I.__version=b.version}function re(I,b,X){if(b.image.length!==6)return;let J=Ee(I,b),ue=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+X);let Q=n.get(ue);if(ue.version!==Q.__version||J===!0){t.activeTexture(i.TEXTURE0+X);let Ue=nt.getPrimaries(nt.workingColorSpace),xe=b.colorSpace===ei?null:nt.getPrimaries(b.colorSpace),Ie=b.colorSpace===ei||Ue===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ie);let Le=b.isCompressedTexture||b.image[0].isCompressedTexture,M=b.image[0]&&b.image[0].isDataTexture,U=[];for(let ie=0;ie<6;ie++)!Le&&!M?U[ie]=y(b.image[ie],!0,s.maxCubemapSize):U[ie]=M?b.image[ie].image:b.image[ie],U[ie]=We(b,U[ie]);let k=U[0],D=r.convert(b.format,b.colorSpace),B=r.convert(b.type),le=x(b.internalFormat,D,B,b.colorSpace),N=b.isVideoTexture!==!0,$=Q.__version===void 0||J===!0,ee=ue.dataReady,ge=C(b,k);Me(i.TEXTURE_CUBE_MAP,b);let ae;if(Le){N&&$&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,le,k.width,k.height);for(let ie=0;ie<6;ie++){ae=U[ie].mipmaps;for(let Ae=0;Ae<ae.length;Ae++){let Re=ae[Ae];b.format!==sn?D!==null?N?ee&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae,0,0,Re.width,Re.height,D,Re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae,le,Re.width,Re.height,0,Re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae,0,0,Re.width,Re.height,D,B,Re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae,le,Re.width,Re.height,0,D,B,Re.data)}}}else{if(ae=b.mipmaps,N&&$){ae.length>0&&ge++;let ie=ze(U[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ge,le,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(M){N?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,U[ie].width,U[ie].height,D,B,U[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,le,U[ie].width,U[ie].height,0,D,B,U[ie].data);for(let Ae=0;Ae<ae.length;Ae++){let fe=ae[Ae].image[ie].image;N?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae+1,0,0,fe.width,fe.height,D,B,fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae+1,le,fe.width,fe.height,0,D,B,fe.data)}}else{N?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,D,B,U[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,le,D,B,U[ie]);for(let Ae=0;Ae<ae.length;Ae++){let Re=ae[Ae];N?ee&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae+1,0,0,D,B,Re.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Ae+1,le,D,B,Re.image[ie])}}}m(b)&&d(i.TEXTURE_CUBE_MAP),Q.__version=ue.version,b.onUpdate&&b.onUpdate(b)}I.__version=b.version}function Te(I,b,X,J,ue,Q){let Ue=r.convert(X.format,X.colorSpace),xe=r.convert(X.type),Ie=x(X.internalFormat,Ue,xe,X.colorSpace),Le=n.get(b),M=n.get(X);if(M.__renderTarget=b,!Le.__hasExternalTextures){let U=Math.max(1,b.width>>Q),k=Math.max(1,b.height>>Q);ue===i.TEXTURE_3D||ue===i.TEXTURE_2D_ARRAY?t.texImage3D(ue,Q,Ie,U,k,b.depth,0,Ue,xe,null):t.texImage2D(ue,Q,Ie,U,k,0,Ue,xe,null)}t.bindFramebuffer(i.FRAMEBUFFER,I),he(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,ue,M.__webglTexture,0,ve(b)):(ue===i.TEXTURE_2D||ue>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ue<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,ue,M.__webglTexture,Q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ne(I,b,X){if(i.bindRenderbuffer(i.RENDERBUFFER,I),b.depthBuffer){let J=b.depthTexture,ue=J&&J.isDepthTexture?J.type:null,Q=g(b.stencilBuffer,ue),Ue=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=ve(b);he(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,xe,Q,b.width,b.height):X?i.renderbufferStorageMultisample(i.RENDERBUFFER,xe,Q,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,Q,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ue,i.RENDERBUFFER,I)}else{let J=b.textures;for(let ue=0;ue<J.length;ue++){let Q=J[ue],Ue=r.convert(Q.format,Q.colorSpace),xe=r.convert(Q.type),Ie=x(Q.internalFormat,Ue,xe,Q.colorSpace),Le=ve(b);X&&he(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Le,Ie,b.width,b.height):he(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Le,Ie,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,Ie,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Pe(I,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,I),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let J=n.get(b.depthTexture);J.__renderTarget=b,(!J.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),H(b.depthTexture,0);let ue=J.__webglTexture,Q=ve(b);if(b.depthTexture.format===ds)he(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ue,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ue,0);else if(b.depthTexture.format===Es)he(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ue,0,Q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ue,0);else throw new Error("Unknown depthTexture format")}function Je(I){let b=n.get(I),X=I.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==I.depthTexture){let J=I.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),J){let ue=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,J.removeEventListener("dispose",ue)};J.addEventListener("dispose",ue),b.__depthDisposeCallback=ue}b.__boundDepthTexture=J}if(I.depthTexture&&!b.__autoAllocateDepthBuffer){if(X)throw new Error("target.depthTexture not supported in Cube render targets");let J=I.texture.mipmaps;J&&J.length>0?Pe(b.__webglFramebuffer[0],I):Pe(b.__webglFramebuffer,I)}else if(X){b.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[J]),b.__webglDepthbuffer[J]===void 0)b.__webglDepthbuffer[J]=i.createRenderbuffer(),Ne(b.__webglDepthbuffer[J],I,!1);else{let ue=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Q=b.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,Q),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,Q)}}else{let J=I.texture.mipmaps;if(J&&J.length>0?t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Ne(b.__webglDepthbuffer,I,!1);else{let ue=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Q=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Q),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,Q)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function je(I,b,X){let J=n.get(I);b!==void 0&&Te(J.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),X!==void 0&&Je(I)}function O(I){let b=I.texture,X=n.get(I),J=n.get(b);I.addEventListener("dispose",w);let ue=I.textures,Q=I.isWebGLCubeRenderTarget===!0,Ue=ue.length>1;if(Ue||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=b.version,o.memory.textures++),Q){X.__webglFramebuffer=[];for(let xe=0;xe<6;xe++)if(b.mipmaps&&b.mipmaps.length>0){X.__webglFramebuffer[xe]=[];for(let Ie=0;Ie<b.mipmaps.length;Ie++)X.__webglFramebuffer[xe][Ie]=i.createFramebuffer()}else X.__webglFramebuffer[xe]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){X.__webglFramebuffer=[];for(let xe=0;xe<b.mipmaps.length;xe++)X.__webglFramebuffer[xe]=i.createFramebuffer()}else X.__webglFramebuffer=i.createFramebuffer();if(Ue)for(let xe=0,Ie=ue.length;xe<Ie;xe++){let Le=n.get(ue[xe]);Le.__webglTexture===void 0&&(Le.__webglTexture=i.createTexture(),o.memory.textures++)}if(I.samples>0&&he(I)===!1){X.__webglMultisampledFramebuffer=i.createFramebuffer(),X.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let xe=0;xe<ue.length;xe++){let Ie=ue[xe];X.__webglColorRenderbuffer[xe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,X.__webglColorRenderbuffer[xe]);let Le=r.convert(Ie.format,Ie.colorSpace),M=r.convert(Ie.type),U=x(Ie.internalFormat,Le,M,Ie.colorSpace,I.isXRRenderTarget===!0),k=ve(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,k,U,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xe,i.RENDERBUFFER,X.__webglColorRenderbuffer[xe])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(X.__webglDepthRenderbuffer=i.createRenderbuffer(),Ne(X.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Q){t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Me(i.TEXTURE_CUBE_MAP,b);for(let xe=0;xe<6;xe++)if(b.mipmaps&&b.mipmaps.length>0)for(let Ie=0;Ie<b.mipmaps.length;Ie++)Te(X.__webglFramebuffer[xe][Ie],I,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,Ie);else Te(X.__webglFramebuffer[xe],I,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xe,0);m(b)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ue){for(let xe=0,Ie=ue.length;xe<Ie;xe++){let Le=ue[xe],M=n.get(Le),U=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(U=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(U,M.__webglTexture),Me(U,Le),Te(X.__webglFramebuffer,I,Le,i.COLOR_ATTACHMENT0+xe,U,0),m(Le)&&d(U)}t.unbindTexture()}else{let xe=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(xe=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(xe,J.__webglTexture),Me(xe,b),b.mipmaps&&b.mipmaps.length>0)for(let Ie=0;Ie<b.mipmaps.length;Ie++)Te(X.__webglFramebuffer[Ie],I,b,i.COLOR_ATTACHMENT0,xe,Ie);else Te(X.__webglFramebuffer,I,b,i.COLOR_ATTACHMENT0,xe,0);m(b)&&d(xe),t.unbindTexture()}I.depthBuffer&&Je(I)}function ce(I){let b=I.textures;for(let X=0,J=b.length;X<J;X++){let ue=b[X];if(m(ue)){let Q=E(I),Ue=n.get(ue).__webglTexture;t.bindTexture(Q,Ue),d(Q),t.unbindTexture()}}}let oe=[],te=[];function se(I){if(I.samples>0){if(he(I)===!1){let b=I.textures,X=I.width,J=I.height,ue=i.COLOR_BUFFER_BIT,Q=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ue=n.get(I),xe=b.length>1;if(xe)for(let Le=0;Le<b.length;Le++)t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ue.__webglMultisampledFramebuffer);let Ie=I.texture.mipmaps;Ie&&Ie.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ue.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ue.__webglFramebuffer);for(let Le=0;Le<b.length;Le++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(ue|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(ue|=i.STENCIL_BUFFER_BIT)),xe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ue.__webglColorRenderbuffer[Le]);let M=n.get(b[Le]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,M,0)}i.blitFramebuffer(0,0,X,J,0,0,X,J,ue,i.NEAREST),l===!0&&(oe.length=0,te.length=0,oe.push(i.COLOR_ATTACHMENT0+Le),I.depthBuffer&&I.resolveDepthBuffer===!1&&(oe.push(Q),te.push(Q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,te)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,oe))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),xe)for(let Le=0;Le<b.length;Le++){t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.RENDERBUFFER,Ue.__webglColorRenderbuffer[Le]);let M=n.get(b[Le]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.TEXTURE_2D,M,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ue.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){let b=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function ve(I){return Math.min(s.maxSamples,I.samples)}function he(I){let b=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Se(I){let b=o.render.frame;h.get(I)!==b&&(h.set(I,b),I.update())}function We(I,b){let X=I.colorSpace,J=I.format,ue=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||X!==Ui&&X!==ei&&(nt.getTransfer(X)===at?(J!==sn||ue!==Un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",X)),b}function ze(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=L,this.setTexture2D=H,this.setTexture2DArray=V,this.setTexture3D=j,this.setTextureCube=G,this.rebindTextures=je,this.setupRenderTarget=O,this.updateRenderTargetMipmap=ce,this.updateMultisampleRenderTarget=se,this.setupDepthRenderbuffer=Je,this.setupFrameBufferTexture=Te,this.useMultisampledRTT=he}function F_(i,e){function t(n,s=ei){let r,o=nt.getTransfer(s);if(n===Un)return i.UNSIGNED_BYTE;if(n===ma)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ga)return i.UNSIGNED_SHORT_5_5_5_1;if(n===mc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===gc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===fc)return i.BYTE;if(n===pc)return i.SHORT;if(n===Ms)return i.UNSIGNED_SHORT;if(n===pa)return i.INT;if(n===vi)return i.UNSIGNED_INT;if(n===pn)return i.FLOAT;if(n===Ss)return i.HALF_FLOAT;if(n===_c)return i.ALPHA;if(n===xc)return i.RGB;if(n===sn)return i.RGBA;if(n===ds)return i.DEPTH_COMPONENT;if(n===Es)return i.DEPTH_STENCIL;if(n===_a)return i.RED;if(n===xa)return i.RED_INTEGER;if(n===yc)return i.RG;if(n===ya)return i.RG_INTEGER;if(n===va)return i.RGBA_INTEGER;if(n===Fr||n===Or||n===Br||n===kr)if(o===at)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ma||n===Sa||n===ba||n===Ea)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ma)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Sa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ba)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ea)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===wa||n===Ta||n===Aa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===wa||n===Ta)return o===at?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Aa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ra||n===Ca||n===Ia||n===Pa||n===La||n===Da||n===Ua||n===Na||n===Fa||n===Oa||n===Ba||n===ka||n===za||n===Ha)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ra)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ca)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ia)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Pa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===La)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Da)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ua)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Na)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Fa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Oa)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ba)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ka)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===za)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ha)return o===at?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Va||n===Ga||n===Wa)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Va)return o===at?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ga)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Wa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Xa||n===qa||n===Ya||n===Za)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Xa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===qa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ya)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Za)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===bs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var O_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,B_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,zc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new gr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Dn({vertexShader:O_,fragmentShader:B_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ke(new Oi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Hc=class extends Zn{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,_=null,y=typeof XRWebGLBinding<"u",m=new zc,d={},E=t.getContextAttributes(),x=null,g=null,C=[],A=[],w=new be,P=null,S=new Ft;S.viewport=new ot;let v=new Ft;v.viewport=new ot;let R=[S,v],L=new ea,z=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ne){let re=C[ne];return re===void 0&&(re=new ms,C[ne]=re),re.getTargetRaySpace()},this.getControllerGrip=function(ne){let re=C[ne];return re===void 0&&(re=new ms,C[ne]=re),re.getGripSpace()},this.getHand=function(ne){let re=C[ne];return re===void 0&&(re=new ms,C[ne]=re),re.getHandSpace()};function H(ne){let re=A.indexOf(ne.inputSource);if(re===-1)return;let Te=C[re];Te!==void 0&&(Te.update(ne.inputSource,ne.frame,c||o),Te.dispatchEvent({type:ne.type,data:ne.inputSource}))}function V(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",j);for(let ne=0;ne<C.length;ne++){let re=A[ne];re!==null&&(A[ne]=null,C[ne].disconnect(re))}z=null,Y=null,m.reset();for(let ne in d)delete d[ne];e.setRenderTarget(x),p=null,f=null,u=null,s=null,g=null,Ge.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ne){r=ne,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ne){a=ne,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(ne){c=ne},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&y&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(ne){if(s=ne,s!==null){if(x=e.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",V),s.addEventListener("inputsourceschange",j),E.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let Te=null,Ne=null,Pe=null;E.depth&&(Pe=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Te=E.stencil?Es:ds,Ne=E.stencil?bs:vi);let Je={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Je),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),g=new Sn(f.textureWidth,f.textureHeight,{format:sn,type:Un,depthTexture:new mr(f.textureWidth,f.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,Te),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let Te={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,Te),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),g=new Sn(p.framebufferWidth,p.framebufferHeight,{format:sn,type:Un,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ge.setContext(s),Ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function j(ne){for(let re=0;re<ne.removed.length;re++){let Te=ne.removed[re],Ne=A.indexOf(Te);Ne>=0&&(A[Ne]=null,C[Ne].disconnect(Te))}for(let re=0;re<ne.added.length;re++){let Te=ne.added[re],Ne=A.indexOf(Te);if(Ne===-1){for(let Je=0;Je<C.length;Je++)if(Je>=A.length){A.push(Te),Ne=Je;break}else if(A[Je]===null){A[Je]=Te,Ne=Je;break}if(Ne===-1)break}let Pe=C[Ne];Pe&&Pe.connect(Te)}}let G=new F,de=new F;function pe(ne,re,Te){G.setFromMatrixPosition(re.matrixWorld),de.setFromMatrixPosition(Te.matrixWorld);let Ne=G.distanceTo(de),Pe=re.projectionMatrix.elements,Je=Te.projectionMatrix.elements,je=Pe[14]/(Pe[10]-1),O=Pe[14]/(Pe[10]+1),ce=(Pe[9]+1)/Pe[5],oe=(Pe[9]-1)/Pe[5],te=(Pe[8]-1)/Pe[0],se=(Je[8]+1)/Je[0],ve=je*te,he=je*se,Se=Ne/(-te+se),We=Se*-te;if(re.matrixWorld.decompose(ne.position,ne.quaternion,ne.scale),ne.translateX(We),ne.translateZ(Se),ne.matrixWorld.compose(ne.position,ne.quaternion,ne.scale),ne.matrixWorldInverse.copy(ne.matrixWorld).invert(),Pe[10]===-1)ne.projectionMatrix.copy(re.projectionMatrix),ne.projectionMatrixInverse.copy(re.projectionMatrixInverse);else{let ze=je+Se,I=O+Se,b=ve-We,X=he+(Ne-We),J=ce*O/I*ze,ue=oe*O/I*ze;ne.projectionMatrix.makePerspective(b,X,J,ue,ze,I),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert()}}function ye(ne,re){re===null?ne.matrixWorld.copy(ne.matrix):ne.matrixWorld.multiplyMatrices(re.matrixWorld,ne.matrix),ne.matrixWorldInverse.copy(ne.matrixWorld).invert()}this.updateCamera=function(ne){if(s===null)return;let re=ne.near,Te=ne.far;m.texture!==null&&(m.depthNear>0&&(re=m.depthNear),m.depthFar>0&&(Te=m.depthFar)),L.near=v.near=S.near=re,L.far=v.far=S.far=Te,(z!==L.near||Y!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),z=L.near,Y=L.far),L.layers.mask=ne.layers.mask|6,S.layers.mask=L.layers.mask&3,v.layers.mask=L.layers.mask&5;let Ne=ne.parent,Pe=L.cameras;ye(L,Ne);for(let Je=0;Je<Pe.length;Je++)ye(Pe[Je],Ne);Pe.length===2?pe(L,S,v):L.projectionMatrix.copy(S.projectionMatrix),Me(ne,L,Ne)};function Me(ne,re,Te){Te===null?ne.matrix.copy(re.matrixWorld):(ne.matrix.copy(Te.matrixWorld),ne.matrix.invert(),ne.matrix.multiply(re.matrixWorld)),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.updateMatrixWorld(!0),ne.projectionMatrix.copy(re.projectionMatrix),ne.projectionMatrixInverse.copy(re.projectionMatrixInverse),ne.isPerspectiveCamera&&(ne.fov=Co*2*Math.atan(1/ne.projectionMatrix.elements[5]),ne.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(ne){l=ne,f!==null&&(f.fixedFoveation=ne),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=ne)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(ne){return d[ne]};let Ee=null;function Ze(ne,re){if(h=re.getViewerPose(c||o),_=re,h!==null){let Te=h.views;p!==null&&(e.setRenderTargetFramebuffer(g,p.framebuffer),e.setRenderTarget(g));let Ne=!1;Te.length!==L.cameras.length&&(L.cameras.length=0,Ne=!0);for(let O=0;O<Te.length;O++){let ce=Te[O],oe=null;if(p!==null)oe=p.getViewport(ce);else{let se=u.getViewSubImage(f,ce);oe=se.viewport,O===0&&(e.setRenderTargetTextures(g,se.colorTexture,se.depthStencilTexture),e.setRenderTarget(g))}let te=R[O];te===void 0&&(te=new Ft,te.layers.enable(O),te.viewport=new ot,R[O]=te),te.matrix.fromArray(ce.transform.matrix),te.matrix.decompose(te.position,te.quaternion,te.scale),te.projectionMatrix.fromArray(ce.projectionMatrix),te.projectionMatrixInverse.copy(te.projectionMatrix).invert(),te.viewport.set(oe.x,oe.y,oe.width,oe.height),O===0&&(L.matrix.copy(te.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Ne===!0&&L.cameras.push(te)}let Pe=s.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){u=n.getBinding();let O=u.getDepthInformation(Te[0]);O&&O.isValid&&O.texture&&m.init(O,s.renderState)}if(Pe&&Pe.includes("camera-access")&&y){e.state.unbindTexture(),u=n.getBinding();for(let O=0;O<Te.length;O++){let ce=Te[O].camera;if(ce){let oe=d[ce];oe||(oe=new gr,d[ce]=oe);let te=u.getCameraImage(ce);oe.sourceTexture=te}}}}for(let Te=0;Te<C.length;Te++){let Ne=A[Te],Pe=C[Te];Ne!==null&&Pe!==void 0&&Pe.update(Ne,re,c||o)}Ee&&Ee(ne,re),re.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:re}),_=null}let Ge=new cd;Ge.setAnimationLoop(Ze),this.setAnimationLoop=function(ne){Ee=ne},this.dispose=function(){}}},Gi=new bn,k_=new Qe;function z_(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,bc(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,E,x,g){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,g)):d.isMeshMatcapMaterial?(r(m,d),_(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),y(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,E,x):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Rt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Rt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let E=e.get(d),x=E.envMap,g=E.envMapRotation;x&&(m.envMap.value=x,Gi.copy(g),Gi.x*=-1,Gi.y*=-1,Gi.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Gi.y*=-1,Gi.z*=-1),m.envMapRotation.value.setFromMatrix4(k_.makeRotationFromEuler(Gi)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,E,x){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*E,m.scale.value=x*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,E){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Rt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){let E=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function H_(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(E,x){let g=x.program;n.uniformBlockBinding(E,g)}function c(E,x){let g=s[E.id];g===void 0&&(_(E),g=h(E),s[E.id]=g,E.addEventListener("dispose",m));let C=x.program;n.updateUBOMapping(E,C);let A=e.render.frame;r[E.id]!==A&&(f(E),r[E.id]=A)}function h(E){let x=u();E.__bindingPointIndex=x;let g=i.createBuffer(),C=E.__size,A=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,g),i.bufferData(i.UNIFORM_BUFFER,C,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,g),g}function u(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(E){let x=s[E.id],g=E.uniforms,C=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let A=0,w=g.length;A<w;A++){let P=Array.isArray(g[A])?g[A]:[g[A]];for(let S=0,v=P.length;S<v;S++){let R=P[S];if(p(R,A,S,C)===!0){let L=R.__offset,z=Array.isArray(R.value)?R.value:[R.value],Y=0;for(let H=0;H<z.length;H++){let V=z[H],j=y(V);typeof V=="number"||typeof V=="boolean"?(R.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,L+Y,R.__data)):V.isMatrix3?(R.__data[0]=V.elements[0],R.__data[1]=V.elements[1],R.__data[2]=V.elements[2],R.__data[3]=0,R.__data[4]=V.elements[3],R.__data[5]=V.elements[4],R.__data[6]=V.elements[5],R.__data[7]=0,R.__data[8]=V.elements[6],R.__data[9]=V.elements[7],R.__data[10]=V.elements[8],R.__data[11]=0):(V.toArray(R.__data,Y),Y+=j.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,R.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(E,x,g,C){let A=E.value,w=x+"_"+g;if(C[w]===void 0)return typeof A=="number"||typeof A=="boolean"?C[w]=A:C[w]=A.clone(),!0;{let P=C[w];if(typeof A=="number"||typeof A=="boolean"){if(P!==A)return C[w]=A,!0}else if(P.equals(A)===!1)return P.copy(A),!0}return!1}function _(E){let x=E.uniforms,g=0,C=16;for(let w=0,P=x.length;w<P;w++){let S=Array.isArray(x[w])?x[w]:[x[w]];for(let v=0,R=S.length;v<R;v++){let L=S[v],z=Array.isArray(L.value)?L.value:[L.value];for(let Y=0,H=z.length;Y<H;Y++){let V=z[Y],j=y(V),G=g%C,de=G%j.boundary,pe=G+de;g+=de,pe!==0&&C-pe<j.storage&&(g+=C-pe),L.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=g,g+=j.storage}}}let A=g%C;return A>0&&(g+=C-A),E.__size=g,E.__cache={},this}function y(E){let x={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(x.boundary=4,x.storage=4):E.isVector2?(x.boundary=8,x.storage=8):E.isVector3||E.isColor?(x.boundary=16,x.storage=12):E.isVector4?(x.boundary=16,x.storage=16):E.isMatrix3?(x.boundary=48,x.storage=48):E.isMatrix4?(x.boundary=64,x.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),x}function m(E){let x=E.target;x.removeEventListener("dispose",m);let g=o.indexOf(x.__bindingPointIndex);o.splice(g,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function d(){for(let E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}var Hr=class{constructor(e={}){let{canvas:t=Pu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let _=new Uint32Array(4),y=new Int32Array(4),m=null,d=null,E=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Qn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let g=this,C=!1;this._outputColorSpace=It;let A=0,w=0,P=null,S=-1,v=null,R=new ot,L=new ot,z=null,Y=new Ve(0),H=0,V=t.width,j=t.height,G=1,de=null,pe=null,ye=new ot(0,0,V,j),Me=new ot(0,0,V,j),Ee=!1,Ze=new gs,Ge=!1,ne=!1,re=new Qe,Te=new F,Ne=new ot,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Je=!1;function je(){return P===null?G:1}let O=n;function ce(T,W){return t.getContext(T,W)}try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",ee,!1),t.addEventListener("webglcontextrestored",ge,!1),t.addEventListener("webglcontextcreationerror",ae,!1),O===null){let W="webgl2";if(O=ce(W,T),O===null)throw ce(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let oe,te,se,ve,he,Se,We,ze,I,b,X,J,ue,Q,Ue,xe,Ie,Le,M,U,k,D,B,le;function N(){oe=new r0(O),oe.init(),D=new F_(O,oe),te=new jg(O,oe,e,D),se=new U_(O,oe),te.reversedDepthBuffer&&f&&se.buffers.depth.setReversed(!0),ve=new l0(O),he=new M_,Se=new N_(O,oe,se,he,te,D,ve),We=new e0(g),ze=new s0(g),I=new pp(O),B=new $g(O,I),b=new o0(O,I,ve,B),X=new h0(O,b,I,ve),M=new c0(O,te,Se),xe=new Qg(he),J=new v_(g,We,ze,oe,te,B,xe),ue=new z_(g,he),Q=new b_,Ue=new C_(oe),Le=new Jg(g,We,ze,se,X,p,l),Ie=new L_(g,X,te),le=new H_(O,ve,te,se),U=new Kg(O,oe,ve),k=new a0(O,oe,ve),ve.programs=J.programs,g.capabilities=te,g.extensions=oe,g.properties=he,g.renderLists=Q,g.shadowMap=Ie,g.state=se,g.info=ve}N();let $=new Hc(g,O);this.xr=$,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let T=oe.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=oe.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(T){T!==void 0&&(G=T,this.setSize(V,j,!1))},this.getSize=function(T){return T.set(V,j)},this.setSize=function(T,W,Z=!0){if($.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=T,j=W,t.width=Math.floor(T*G),t.height=Math.floor(W*G),Z===!0&&(t.style.width=T+"px",t.style.height=W+"px"),this.setViewport(0,0,T,W)},this.getDrawingBufferSize=function(T){return T.set(V*G,j*G).floor()},this.setDrawingBufferSize=function(T,W,Z){V=T,j=W,G=Z,t.width=Math.floor(T*Z),t.height=Math.floor(W*Z),this.setViewport(0,0,T,W)},this.getCurrentViewport=function(T){return T.copy(R)},this.getViewport=function(T){return T.copy(ye)},this.setViewport=function(T,W,Z,K){T.isVector4?ye.set(T.x,T.y,T.z,T.w):ye.set(T,W,Z,K),se.viewport(R.copy(ye).multiplyScalar(G).round())},this.getScissor=function(T){return T.copy(Me)},this.setScissor=function(T,W,Z,K){T.isVector4?Me.set(T.x,T.y,T.z,T.w):Me.set(T,W,Z,K),se.scissor(L.copy(Me).multiplyScalar(G).round())},this.getScissorTest=function(){return Ee},this.setScissorTest=function(T){se.setScissorTest(Ee=T)},this.setOpaqueSort=function(T){de=T},this.setTransparentSort=function(T){pe=T},this.getClearColor=function(T){return T.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor(...arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha(...arguments)},this.clear=function(T=!0,W=!0,Z=!0){let K=0;if(T){let q=!1;if(P!==null){let _e=P.texture.format;q=_e===va||_e===ya||_e===xa}if(q){let _e=P.texture.type,Ce=_e===Un||_e===vi||_e===Ms||_e===bs||_e===ma||_e===ga,Fe=Le.getClearColor(),De=Le.getClearAlpha(),He=Fe.r,Xe=Fe.g,Be=Fe.b;Ce?(_[0]=He,_[1]=Xe,_[2]=Be,_[3]=De,O.clearBufferuiv(O.COLOR,0,_)):(y[0]=He,y[1]=Xe,y[2]=Be,y[3]=De,O.clearBufferiv(O.COLOR,0,y))}else K|=O.COLOR_BUFFER_BIT}W&&(K|=O.DEPTH_BUFFER_BIT),Z&&(K|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ee,!1),t.removeEventListener("webglcontextrestored",ge,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),Le.dispose(),Q.dispose(),Ue.dispose(),he.dispose(),We.dispose(),ze.dispose(),X.dispose(),B.dispose(),le.dispose(),J.dispose(),$.dispose(),$.removeEventListener("sessionstart",lt),$.removeEventListener("sessionend",Et),vt.stop()};function ee(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function ge(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;let T=ve.autoReset,W=Ie.enabled,Z=Ie.autoUpdate,K=Ie.needsUpdate,q=Ie.type;N(),ve.autoReset=T,Ie.enabled=W,Ie.autoUpdate=Z,Ie.needsUpdate=K,Ie.type=q}function ae(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function ie(T){let W=T.target;W.removeEventListener("dispose",ie),Ae(W)}function Ae(T){Re(T),he.remove(T)}function Re(T){let W=he.get(T).programs;W!==void 0&&(W.forEach(function(Z){J.releaseProgram(Z)}),T.isShaderMaterial&&J.releaseShaderCache(T))}this.renderBufferDirect=function(T,W,Z,K,q,_e){W===null&&(W=Pe);let Ce=q.isMesh&&q.matrixWorld.determinant()<0,Fe=$i(T,W,Z,K,q);se.setMaterial(K,Ce);let De=Z.index,He=1;if(K.wireframe===!0){if(De=b.getWireframeAttribute(Z),De===void 0)return;He=2}let Xe=Z.drawRange,Be=Z.attributes.position,tt=Xe.start*He,ct=(Xe.start+Xe.count)*He;_e!==null&&(tt=Math.max(tt,_e.start*He),ct=Math.min(ct,(_e.start+_e.count)*He)),De!==null?(tt=Math.max(tt,0),ct=Math.min(ct,De.count)):Be!=null&&(tt=Math.max(tt,0),ct=Math.min(ct,Be.count));let Mt=ct-tt;if(Mt<0||Mt===1/0)return;B.setup(q,K,Fe,Z,De);let pt,ht=U;if(De!==null&&(pt=I.get(De),ht=k,ht.setIndex(pt)),q.isMesh)K.wireframe===!0?(se.setLineWidth(K.wireframeLinewidth*je()),ht.setMode(O.LINES)):ht.setMode(O.TRIANGLES);else if(q.isLine){let ke=K.linewidth;ke===void 0&&(ke=1),se.setLineWidth(ke*je()),q.isLineSegments?ht.setMode(O.LINES):q.isLineLoop?ht.setMode(O.LINE_LOOP):ht.setMode(O.LINE_STRIP)}else q.isPoints?ht.setMode(O.POINTS):q.isSprite&&ht.setMode(O.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)fs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ht.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(oe.get("WEBGL_multi_draw"))ht.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let ke=q._multiDrawStarts,_t=q._multiDrawCounts,rt=q._multiDrawCount,an=De?I.get(De).bytesPerElement:1,Ki=he.get(K).currentProgram.getUniforms();for(let ln=0;ln<rt;ln++)Ki.setValue(O,"_gl_DrawID",ln),ht.render(ke[ln]/an,_t[ln])}else if(q.isInstancedMesh)ht.renderInstances(tt,Mt,q.count);else if(Z.isInstancedBufferGeometry){let ke=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,_t=Math.min(Z.instanceCount,ke);ht.renderInstances(tt,Mt,_t)}else ht.render(tt,Mt)};function fe(T,W,Z){T.transparent===!0&&T.side===Bt&&T.forceSinglePass===!1?(T.side=Rt,T.needsUpdate=!0,$t(T,W,Z),T.side=Qt,T.needsUpdate=!0,$t(T,W,Z),T.side=Bt):$t(T,W,Z)}this.compile=function(T,W,Z=null){Z===null&&(Z=T),d=Ue.get(Z),d.init(W),x.push(d),Z.traverseVisible(function(q){q.isLight&&q.layers.test(W.layers)&&(d.pushLight(q),q.castShadow&&d.pushShadow(q))}),T!==Z&&T.traverseVisible(function(q){q.isLight&&q.layers.test(W.layers)&&(d.pushLight(q),q.castShadow&&d.pushShadow(q))}),d.setupLights();let K=new Set;return T.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let _e=q.material;if(_e)if(Array.isArray(_e))for(let Ce=0;Ce<_e.length;Ce++){let Fe=_e[Ce];fe(Fe,Z,q),K.add(Fe)}else fe(_e,Z,q),K.add(_e)}),d=x.pop(),K},this.compileAsync=function(T,W,Z=null){let K=this.compile(T,W,Z);return new Promise(q=>{function _e(){if(K.forEach(function(Ce){he.get(Ce).currentProgram.isReady()&&K.delete(Ce)}),K.size===0){q(T);return}setTimeout(_e,10)}oe.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let me=null;function Oe(T){me&&me(T)}function lt(){vt.stop()}function Et(){vt.start()}let vt=new cd;vt.setAnimationLoop(Oe),typeof self<"u"&&vt.setContext(self),this.setAnimationLoop=function(T){me=T,$.setAnimationLoop(T),T===null?vt.stop():vt.start()},$.addEventListener("sessionstart",lt),$.addEventListener("sessionend",Et),this.render=function(T,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),$.enabled===!0&&$.isPresenting===!0&&($.cameraAutoUpdate===!0&&$.updateCamera(W),W=$.getCamera()),T.isScene===!0&&T.onBeforeRender(g,T,W,P),d=Ue.get(T,x.length),d.init(W),x.push(d),re.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),Ze.setFromProjectionMatrix(re,Pn,W.reversedDepth),ne=this.localClippingEnabled,Ge=xe.init(this.clippingPlanes,ne),m=Q.get(T,E.length),m.init(),E.push(m),$.enabled===!0&&$.isPresenting===!0){let _e=g.xr.getDepthSensingMesh();_e!==null&&wt(_e,W,-1/0,g.sortObjects)}wt(T,W,0,g.sortObjects),m.finish(),g.sortObjects===!0&&m.sort(de,pe),Je=$.enabled===!1||$.isPresenting===!1||$.hasDepthSensing()===!1,Je&&Le.addToRenderList(m,T),this.info.render.frame++,Ge===!0&&xe.beginShadows();let Z=d.state.shadowsArray;Ie.render(Z,T,W),Ge===!0&&xe.endShadows(),this.info.autoReset===!0&&this.info.reset();let K=m.opaque,q=m.transmissive;if(d.setupLights(),W.isArrayCamera){let _e=W.cameras;if(q.length>0)for(let Ce=0,Fe=_e.length;Ce<Fe;Ce++){let De=_e[Ce];xn(K,q,T,De)}Je&&Le.render(T);for(let Ce=0,Fe=_e.length;Ce<Fe;Ce++){let De=_e[Ce];Jt(m,T,De,De.viewport)}}else q.length>0&&xn(K,q,T,W),Je&&Le.render(T),Jt(m,T,W);P!==null&&w===0&&(Se.updateMultisampleRenderTarget(P),Se.updateRenderTargetMipmap(P)),T.isScene===!0&&T.onAfterRender(g,T,W),B.resetDefaultState(),S=-1,v=null,x.pop(),x.length>0?(d=x[x.length-1],Ge===!0&&xe.setGlobalState(g.clippingPlanes,d.state.camera)):d=null,E.pop(),E.length>0?m=E[E.length-1]:m=null};function wt(T,W,Z,K){if(T.visible===!1)return;if(T.layers.test(W.layers)){if(T.isGroup)Z=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(W);else if(T.isLight)d.pushLight(T),T.castShadow&&d.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Ze.intersectsSprite(T)){K&&Ne.setFromMatrixPosition(T.matrixWorld).applyMatrix4(re);let Ce=X.update(T),Fe=T.material;Fe.visible&&m.push(T,Ce,Fe,Z,Ne.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Ze.intersectsObject(T))){let Ce=X.update(T),Fe=T.material;if(K&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ne.copy(T.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),Ne.copy(Ce.boundingSphere.center)),Ne.applyMatrix4(T.matrixWorld).applyMatrix4(re)),Array.isArray(Fe)){let De=Ce.groups;for(let He=0,Xe=De.length;He<Xe;He++){let Be=De[He],tt=Fe[Be.materialIndex];tt&&tt.visible&&m.push(T,Ce,tt,Z,Ne.z,Be)}}else Fe.visible&&m.push(T,Ce,Fe,Z,Ne.z,null)}}let _e=T.children;for(let Ce=0,Fe=_e.length;Ce<Fe;Ce++)wt(_e[Ce],W,Z,K)}function Jt(T,W,Z,K){let q=T.opaque,_e=T.transmissive,Ce=T.transparent;d.setupLightsView(Z),Ge===!0&&xe.setGlobalState(g.clippingPlanes,Z),K&&se.viewport(R.copy(K)),q.length>0&&dt(q,W,Z),_e.length>0&&dt(_e,W,Z),Ce.length>0&&dt(Ce,W,Z),se.buffers.depth.setTest(!0),se.buffers.depth.setMask(!0),se.buffers.color.setMask(!0),se.setPolygonOffset(!1)}function xn(T,W,Z,K){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[K.id]===void 0&&(d.state.transmissionRenderTarget[K.id]=new Sn(1,1,{generateMipmaps:!0,type:oe.has("EXT_color_buffer_half_float")||oe.has("EXT_color_buffer_float")?Ss:Un,minFilter:yi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace}));let _e=d.state.transmissionRenderTarget[K.id],Ce=K.viewport||R;_e.setSize(Ce.z*g.transmissionResolutionScale,Ce.w*g.transmissionResolutionScale);let Fe=g.getRenderTarget(),De=g.getActiveCubeFace(),He=g.getActiveMipmapLevel();g.setRenderTarget(_e),g.getClearColor(Y),H=g.getClearAlpha(),H<1&&g.setClearColor(16777215,.5),g.clear(),Je&&Le.render(Z);let Xe=g.toneMapping;g.toneMapping=Qn;let Be=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),d.setupLightsView(K),Ge===!0&&xe.setGlobalState(g.clippingPlanes,K),dt(T,Z,K),Se.updateMultisampleRenderTarget(_e),Se.updateRenderTargetMipmap(_e),oe.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let ct=0,Mt=W.length;ct<Mt;ct++){let pt=W[ct],ht=pt.object,ke=pt.geometry,_t=pt.material,rt=pt.group;if(_t.side===Bt&&ht.layers.test(K.layers)){let an=_t.side;_t.side=Rt,_t.needsUpdate=!0,Wt(ht,Z,K,ke,_t,rt),_t.side=an,_t.needsUpdate=!0,tt=!0}}tt===!0&&(Se.updateMultisampleRenderTarget(_e),Se.updateRenderTargetMipmap(_e))}g.setRenderTarget(Fe,De,He),g.setClearColor(Y,H),Be!==void 0&&(K.viewport=Be),g.toneMapping=Xe}function dt(T,W,Z){let K=W.isScene===!0?W.overrideMaterial:null;for(let q=0,_e=T.length;q<_e;q++){let Ce=T[q],Fe=Ce.object,De=Ce.geometry,He=Ce.group,Xe=Ce.material;Xe.allowOverride===!0&&K!==null&&(Xe=K),Fe.layers.test(Z.layers)&&Wt(Fe,W,Z,De,Xe,He)}}function Wt(T,W,Z,K,q,_e){T.onBeforeRender(g,W,Z,K,q,_e),T.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),q.onBeforeRender(g,W,Z,K,T,_e),q.transparent===!0&&q.side===Bt&&q.forceSinglePass===!1?(q.side=Rt,q.needsUpdate=!0,g.renderBufferDirect(Z,W,K,q,T,_e),q.side=Qt,q.needsUpdate=!0,g.renderBufferDirect(Z,W,K,q,T,_e),q.side=Bt):g.renderBufferDirect(Z,W,K,q,T,_e),T.onAfterRender(g,W,Z,K,q,_e)}function $t(T,W,Z){W.isScene!==!0&&(W=Pe);let K=he.get(T),q=d.state.lights,_e=d.state.shadowsArray,Ce=q.state.version,Fe=J.getParameters(T,q.state,_e,W,Z),De=J.getProgramCacheKey(Fe),He=K.programs;K.environment=T.isMeshStandardMaterial?W.environment:null,K.fog=W.fog,K.envMap=(T.isMeshStandardMaterial?ze:We).get(T.envMap||K.environment),K.envMapRotation=K.environment!==null&&T.envMap===null?W.environmentRotation:T.envMapRotation,He===void 0&&(T.addEventListener("dispose",ie),He=new Map,K.programs=He);let Xe=He.get(De);if(Xe!==void 0){if(K.currentProgram===Xe&&K.lightsStateVersion===Ce)return Nn(T,Fe),Xe}else Fe.uniforms=J.getUniforms(T),T.onBeforeCompile(Fe,g),Xe=J.acquireProgram(Fe,De),He.set(De,Xe),K.uniforms=Fe.uniforms;let Be=K.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Be.clippingPlanes=xe.uniform),Nn(T,Fe),K.needsLights=_l(T),K.lightsStateVersion=Ce,K.needsLights&&(Be.ambientLightColor.value=q.state.ambient,Be.lightProbe.value=q.state.probe,Be.directionalLights.value=q.state.directional,Be.directionalLightShadows.value=q.state.directionalShadow,Be.spotLights.value=q.state.spot,Be.spotLightShadows.value=q.state.spotShadow,Be.rectAreaLights.value=q.state.rectArea,Be.ltc_1.value=q.state.rectAreaLTC1,Be.ltc_2.value=q.state.rectAreaLTC2,Be.pointLights.value=q.state.point,Be.pointLightShadows.value=q.state.pointShadow,Be.hemisphereLights.value=q.state.hemi,Be.directionalShadowMap.value=q.state.directionalShadowMap,Be.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Be.spotShadowMap.value=q.state.spotShadowMap,Be.spotLightMatrix.value=q.state.spotLightMatrix,Be.spotLightMap.value=q.state.spotLightMap,Be.pointShadowMap.value=q.state.pointShadowMap,Be.pointShadowMatrix.value=q.state.pointShadowMatrix),K.currentProgram=Xe,K.uniformsList=null,Xe}function An(T){if(T.uniformsList===null){let W=T.currentProgram.getUniforms();T.uniformsList=Is.seqWithValue(W.seq,T.uniforms)}return T.uniformsList}function Nn(T,W){let Z=he.get(T);Z.outputColorSpace=W.outputColorSpace,Z.batching=W.batching,Z.batchingColor=W.batchingColor,Z.instancing=W.instancing,Z.instancingColor=W.instancingColor,Z.instancingMorph=W.instancingMorph,Z.skinning=W.skinning,Z.morphTargets=W.morphTargets,Z.morphNormals=W.morphNormals,Z.morphColors=W.morphColors,Z.morphTargetsCount=W.morphTargetsCount,Z.numClippingPlanes=W.numClippingPlanes,Z.numIntersection=W.numClipIntersection,Z.vertexAlphas=W.vertexAlphas,Z.vertexTangents=W.vertexTangents,Z.toneMapping=W.toneMapping}function $i(T,W,Z,K,q){W.isScene!==!0&&(W=Pe),Se.resetTextureUnits();let _e=W.fog,Ce=K.isMeshStandardMaterial?W.environment:null,Fe=P===null?g.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Ui,De=(K.isMeshStandardMaterial?ze:We).get(K.envMap||Ce),He=K.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,Xe=!!Z.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Be=!!Z.morphAttributes.position,tt=!!Z.morphAttributes.normal,ct=!!Z.morphAttributes.color,Mt=Qn;K.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(Mt=g.toneMapping);let pt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,ht=pt!==void 0?pt.length:0,ke=he.get(K),_t=d.state.lights;if(Ge===!0&&(ne===!0||T!==v)){let Xt=T===v&&K.id===S;xe.setState(K,T,Xt)}let rt=!1;K.version===ke.__version?(ke.needsLights&&ke.lightsStateVersion!==_t.state.version||ke.outputColorSpace!==Fe||q.isBatchedMesh&&ke.batching===!1||!q.isBatchedMesh&&ke.batching===!0||q.isBatchedMesh&&ke.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&ke.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&ke.instancing===!1||!q.isInstancedMesh&&ke.instancing===!0||q.isSkinnedMesh&&ke.skinning===!1||!q.isSkinnedMesh&&ke.skinning===!0||q.isInstancedMesh&&ke.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&ke.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&ke.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&ke.instancingMorph===!1&&q.morphTexture!==null||ke.envMap!==De||K.fog===!0&&ke.fog!==_e||ke.numClippingPlanes!==void 0&&(ke.numClippingPlanes!==xe.numPlanes||ke.numIntersection!==xe.numIntersection)||ke.vertexAlphas!==He||ke.vertexTangents!==Xe||ke.morphTargets!==Be||ke.morphNormals!==tt||ke.morphColors!==ct||ke.toneMapping!==Mt||ke.morphTargetsCount!==ht)&&(rt=!0):(rt=!0,ke.__version=K.version);let an=ke.currentProgram;rt===!0&&(an=$t(K,W,q));let Ki=!1,ln=!1,Gs=!1,xt=an.getUniforms(),yn=ke.uniforms;if(se.useProgram(an.program)&&(Ki=!0,ln=!0,Gs=!0),K.id!==S&&(S=K.id,ln=!0),Ki||v!==T){se.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),xt.setValue(O,"projectionMatrix",T.projectionMatrix),xt.setValue(O,"viewMatrix",T.matrixWorldInverse);let Kt=xt.map.cameraPosition;Kt!==void 0&&Kt.setValue(O,Te.setFromMatrixPosition(T.matrixWorld)),te.logarithmicDepthBuffer&&xt.setValue(O,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&xt.setValue(O,"isOrthographic",T.isOrthographicCamera===!0),v!==T&&(v=T,ln=!0,Gs=!0)}if(q.isSkinnedMesh){xt.setOptional(O,q,"bindMatrix"),xt.setOptional(O,q,"bindMatrixInverse");let Xt=q.skeleton;Xt&&(Xt.boneTexture===null&&Xt.computeBoneTexture(),xt.setValue(O,"boneTexture",Xt.boneTexture,Se))}q.isBatchedMesh&&(xt.setOptional(O,q,"batchingTexture"),xt.setValue(O,"batchingTexture",q._matricesTexture,Se),xt.setOptional(O,q,"batchingIdTexture"),xt.setValue(O,"batchingIdTexture",q._indirectTexture,Se),xt.setOptional(O,q,"batchingColorTexture"),q._colorsTexture!==null&&xt.setValue(O,"batchingColorTexture",q._colorsTexture,Se));let vn=Z.morphAttributes;if((vn.position!==void 0||vn.normal!==void 0||vn.color!==void 0)&&M.update(q,Z,an),(ln||ke.receiveShadow!==q.receiveShadow)&&(ke.receiveShadow=q.receiveShadow,xt.setValue(O,"receiveShadow",q.receiveShadow)),K.isMeshGouraudMaterial&&K.envMap!==null&&(yn.envMap.value=De,yn.flipEnvMap.value=De.isCubeTexture&&De.isRenderTargetTexture===!1?-1:1),K.isMeshStandardMaterial&&K.envMap===null&&W.environment!==null&&(yn.envMapIntensity.value=W.environmentIntensity),ln&&(xt.setValue(O,"toneMappingExposure",g.toneMappingExposure),ke.needsLights&&Jr(yn,Gs),_e&&K.fog===!0&&ue.refreshFogUniforms(yn,_e),ue.refreshMaterialUniforms(yn,K,G,j,d.state.transmissionRenderTarget[T.id]),Is.upload(O,An(ke),yn,Se)),K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(Is.upload(O,An(ke),yn,Se),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&xt.setValue(O,"center",q.center),xt.setValue(O,"modelViewMatrix",q.modelViewMatrix),xt.setValue(O,"normalMatrix",q.normalMatrix),xt.setValue(O,"modelMatrix",q.matrixWorld),K.isShaderMaterial||K.isRawShaderMaterial){let Xt=K.uniformsGroups;for(let Kt=0,vl=Xt.length;Kt<vl;Kt++){let wi=Xt[Kt];le.update(wi,an),le.bind(wi,an)}}return an}function Jr(T,W){T.ambientLightColor.needsUpdate=W,T.lightProbe.needsUpdate=W,T.directionalLights.needsUpdate=W,T.directionalLightShadows.needsUpdate=W,T.pointLights.needsUpdate=W,T.pointLightShadows.needsUpdate=W,T.spotLights.needsUpdate=W,T.spotLightShadows.needsUpdate=W,T.rectAreaLights.needsUpdate=W,T.hemisphereLights.needsUpdate=W}function _l(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(T,W,Z){let K=he.get(T);K.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),he.get(T.texture).__webglTexture=W,he.get(T.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:Z,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,W){let Z=he.get(T);Z.__webglFramebuffer=W,Z.__useDefaultFramebuffer=W===void 0};let xl=O.createFramebuffer();this.setRenderTarget=function(T,W=0,Z=0){P=T,A=W,w=Z;let K=!0,q=null,_e=!1,Ce=!1;if(T){let De=he.get(T);if(De.__useDefaultFramebuffer!==void 0)se.bindFramebuffer(O.FRAMEBUFFER,null),K=!1;else if(De.__webglFramebuffer===void 0)Se.setupRenderTarget(T);else if(De.__hasExternalTextures)Se.rebindTextures(T,he.get(T.texture).__webglTexture,he.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Be=T.depthTexture;if(De.__boundDepthTexture!==Be){if(Be!==null&&he.has(Be)&&(T.width!==Be.image.width||T.height!==Be.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Se.setupDepthRenderbuffer(T)}}let He=T.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Ce=!0);let Xe=he.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Xe[W])?q=Xe[W][Z]:q=Xe[W],_e=!0):T.samples>0&&Se.useMultisampledRTT(T)===!1?q=he.get(T).__webglMultisampledFramebuffer:Array.isArray(Xe)?q=Xe[Z]:q=Xe,R.copy(T.viewport),L.copy(T.scissor),z=T.scissorTest}else R.copy(ye).multiplyScalar(G).floor(),L.copy(Me).multiplyScalar(G).floor(),z=Ee;if(Z!==0&&(q=xl),se.bindFramebuffer(O.FRAMEBUFFER,q)&&K&&se.drawBuffers(T,q),se.viewport(R),se.scissor(L),se.setScissorTest(z),_e){let De=he.get(T.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+W,De.__webglTexture,Z)}else if(Ce){let De=W;for(let He=0;He<T.textures.length;He++){let Xe=he.get(T.textures[He]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+He,Xe.__webglTexture,Z,De)}}else if(T!==null&&Z!==0){let De=he.get(T.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,De.__webglTexture,Z)}S=-1},this.readRenderTargetPixels=function(T,W,Z,K,q,_e,Ce,Fe=0){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let De=he.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ce!==void 0&&(De=De[Ce]),De){se.bindFramebuffer(O.FRAMEBUFFER,De);try{let He=T.textures[Fe],Xe=He.format,Be=He.type;if(!te.textureFormatReadable(Xe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!te.textureTypeReadable(Be)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=T.width-K&&Z>=0&&Z<=T.height-q&&(T.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Fe),O.readPixels(W,Z,K,q,D.convert(Xe),D.convert(Be),_e))}finally{let He=P!==null?he.get(P).__webglFramebuffer:null;se.bindFramebuffer(O.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(T,W,Z,K,q,_e,Ce,Fe=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let De=he.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ce!==void 0&&(De=De[Ce]),De)if(W>=0&&W<=T.width-K&&Z>=0&&Z<=T.height-q){se.bindFramebuffer(O.FRAMEBUFFER,De);let He=T.textures[Fe],Xe=He.format,Be=He.type;if(!te.textureFormatReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!te.textureTypeReadable(Be))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let tt=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,tt),O.bufferData(O.PIXEL_PACK_BUFFER,_e.byteLength,O.STREAM_READ),T.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Fe),O.readPixels(W,Z,K,q,D.convert(Xe),D.convert(Be),0);let ct=P!==null?he.get(P).__webglFramebuffer:null;se.bindFramebuffer(O.FRAMEBUFFER,ct);let Mt=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await Lu(O,Mt,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,tt),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,_e),O.deleteBuffer(tt),O.deleteSync(Mt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,W=null,Z=0){let K=Math.pow(2,-Z),q=Math.floor(T.image.width*K),_e=Math.floor(T.image.height*K),Ce=W!==null?W.x:0,Fe=W!==null?W.y:0;Se.setTexture2D(T,0),O.copyTexSubImage2D(O.TEXTURE_2D,Z,0,0,Ce,Fe,q,_e),se.unbindTexture()};let yl=O.createFramebuffer(),$r=O.createFramebuffer();this.copyTextureToTexture=function(T,W,Z=null,K=null,q=0,_e=null){_e===null&&(q!==0?(fs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),_e=q,q=0):_e=0);let Ce,Fe,De,He,Xe,Be,tt,ct,Mt,pt=T.isCompressedTexture?T.mipmaps[_e]:T.image;if(Z!==null)Ce=Z.max.x-Z.min.x,Fe=Z.max.y-Z.min.y,De=Z.isBox3?Z.max.z-Z.min.z:1,He=Z.min.x,Xe=Z.min.y,Be=Z.isBox3?Z.min.z:0;else{let vn=Math.pow(2,-q);Ce=Math.floor(pt.width*vn),Fe=Math.floor(pt.height*vn),T.isDataArrayTexture?De=pt.depth:T.isData3DTexture?De=Math.floor(pt.depth*vn):De=1,He=0,Xe=0,Be=0}K!==null?(tt=K.x,ct=K.y,Mt=K.z):(tt=0,ct=0,Mt=0);let ht=D.convert(W.format),ke=D.convert(W.type),_t;W.isData3DTexture?(Se.setTexture3D(W,0),_t=O.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(Se.setTexture2DArray(W,0),_t=O.TEXTURE_2D_ARRAY):(Se.setTexture2D(W,0),_t=O.TEXTURE_2D),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,W.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,W.unpackAlignment);let rt=O.getParameter(O.UNPACK_ROW_LENGTH),an=O.getParameter(O.UNPACK_IMAGE_HEIGHT),Ki=O.getParameter(O.UNPACK_SKIP_PIXELS),ln=O.getParameter(O.UNPACK_SKIP_ROWS),Gs=O.getParameter(O.UNPACK_SKIP_IMAGES);O.pixelStorei(O.UNPACK_ROW_LENGTH,pt.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,pt.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,He),O.pixelStorei(O.UNPACK_SKIP_ROWS,Xe),O.pixelStorei(O.UNPACK_SKIP_IMAGES,Be);let xt=T.isDataArrayTexture||T.isData3DTexture,yn=W.isDataArrayTexture||W.isData3DTexture;if(T.isDepthTexture){let vn=he.get(T),Xt=he.get(W),Kt=he.get(vn.__renderTarget),vl=he.get(Xt.__renderTarget);se.bindFramebuffer(O.READ_FRAMEBUFFER,Kt.__webglFramebuffer),se.bindFramebuffer(O.DRAW_FRAMEBUFFER,vl.__webglFramebuffer);for(let wi=0;wi<De;wi++)xt&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,he.get(T).__webglTexture,q,Be+wi),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,he.get(W).__webglTexture,_e,Mt+wi)),O.blitFramebuffer(He,Xe,Ce,Fe,tt,ct,Ce,Fe,O.DEPTH_BUFFER_BIT,O.NEAREST);se.bindFramebuffer(O.READ_FRAMEBUFFER,null),se.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(q!==0||T.isRenderTargetTexture||he.has(T)){let vn=he.get(T),Xt=he.get(W);se.bindFramebuffer(O.READ_FRAMEBUFFER,yl),se.bindFramebuffer(O.DRAW_FRAMEBUFFER,$r);for(let Kt=0;Kt<De;Kt++)xt?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,vn.__webglTexture,q,Be+Kt):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,vn.__webglTexture,q),yn?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Xt.__webglTexture,_e,Mt+Kt):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Xt.__webglTexture,_e),q!==0?O.blitFramebuffer(He,Xe,Ce,Fe,tt,ct,Ce,Fe,O.COLOR_BUFFER_BIT,O.NEAREST):yn?O.copyTexSubImage3D(_t,_e,tt,ct,Mt+Kt,He,Xe,Ce,Fe):O.copyTexSubImage2D(_t,_e,tt,ct,He,Xe,Ce,Fe);se.bindFramebuffer(O.READ_FRAMEBUFFER,null),se.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else yn?T.isDataTexture||T.isData3DTexture?O.texSubImage3D(_t,_e,tt,ct,Mt,Ce,Fe,De,ht,ke,pt.data):W.isCompressedArrayTexture?O.compressedTexSubImage3D(_t,_e,tt,ct,Mt,Ce,Fe,De,ht,pt.data):O.texSubImage3D(_t,_e,tt,ct,Mt,Ce,Fe,De,ht,ke,pt):T.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,_e,tt,ct,Ce,Fe,ht,ke,pt.data):T.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,_e,tt,ct,pt.width,pt.height,ht,pt.data):O.texSubImage2D(O.TEXTURE_2D,_e,tt,ct,Ce,Fe,ht,ke,pt);O.pixelStorei(O.UNPACK_ROW_LENGTH,rt),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,an),O.pixelStorei(O.UNPACK_SKIP_PIXELS,Ki),O.pixelStorei(O.UNPACK_SKIP_ROWS,ln),O.pixelStorei(O.UNPACK_SKIP_IMAGES,Gs),_e===0&&W.generateMipmaps&&O.generateMipmap(_t),se.unbindTexture()},this.initRenderTarget=function(T){he.get(T).__webglFramebuffer===void 0&&Se.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Se.setTextureCube(T,0):T.isData3DTexture?Se.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Se.setTexture2DArray(T,0):Se.setTexture2D(T,0),se.unbindTexture()},this.resetState=function(){A=0,w=0,P=null,se.reset(),B.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Pn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}};var Vr=new F;function wn(i,e,t,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Vr.copy(e),Vr[n]=0,Vr.normalize();let c=.5*o/(o+a),h=1-Vr.angleTo(i)/l;return Math.sign(Vr[t])===1?h*c:a/(o+a)+c+c*(1-h)}var Hn=class i extends Bn{constructor(e=1,t=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new F,c=new F,h=new F(e,t,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,f=this.attributes.normal.array,p=this.attributes.uv.array,_=u.length/6,y=new F,m=.5/o;for(let d=0,E=0;d<u.length;d+=3,E+=2)switch(l.fromArray(u,d),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[d+0]=h.x*Math.sign(l.x)+c.x*r,u[d+1]=h.y*Math.sign(l.y)+c.y*r,u[d+2]=h.z*Math.sign(l.z)+c.z*r,f[d+0]=c.x,f[d+1]=c.y,f[d+2]=c.z,Math.floor(d/_)){case 0:y.set(1,0,0),p[E+0]=wn(y,c,"z","y",r,n),p[E+1]=1-wn(y,c,"y","z",r,t);break;case 1:y.set(-1,0,0),p[E+0]=1-wn(y,c,"z","y",r,n),p[E+1]=1-wn(y,c,"y","z",r,t);break;case 2:y.set(0,1,0),p[E+0]=1-wn(y,c,"x","z",r,e),p[E+1]=wn(y,c,"z","x",r,n);break;case 3:y.set(0,-1,0),p[E+0]=1-wn(y,c,"x","z",r,e),p[E+1]=1-wn(y,c,"z","x",r,n);break;case 4:y.set(0,0,1),p[E+0]=1-wn(y,c,"x","y",r,e),p[E+1]=1-wn(y,c,"y","x",r,t);break;case 5:y.set(0,0,-1),p[E+0]=wn(y,c,"x","y",r,e),p[E+1]=1-wn(y,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var el=class extends Jn{constructor(){super();let e=new Bn;e.deleteAttribute("uv");let t=new Yt({side:Rt}),n=new Yt,s=new Ir(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Ke(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new dr(e,n,6),a=new At;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new Ke(e,Ds(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Ke(e,Ds(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Ke(e,Ds(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Ke(e,Ds(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let f=new Ke(e,Ds(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let p=new Ke(e,Ds(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Ds(i){return new Ar({color:0,emissive:16777215,emissiveIntensity:i})}var mn=i=>[i[0]/100,(186-i[1])/100,i[2]/100],Gc=i=>[i[0],-i[1],i[2]],Mi=i=>new F(...i);function Wc(i){return new Ot().setFromRotationMatrix(new Qe().makeBasis(Mi(Gc(i.x)),Mi(Gc(i.y)),Mi(Gc(i.z))))}function tl(i,e){let t=new st,n=[];t.setAttribute("position",new qe(new Float32Array((i+1)*(e+1)*3),3));for(let s=0;s<i;s++)for(let r=0;r<e;r++){let o=s*(e+1)+r,a=o+1,l=o+e+1;n.push(o,a,l,a,l+1,l)}return t.setIndex(n),t}function nl(i,e,t=mn,n=!1){let s=e[0].length,r=i.attributes.position,o=0;for(let h of e)for(let u=0;u<=s;u++)r.setXYZ(o++,...t(h[u%s]));if(r.needsUpdate=!0,n){i.boundingSphere=null,i.boundingBox=null;return}i.computeVertexNormals();let a=i.attributes.normal,l=new F,c=new F;for(let h=0;h<e.length;h++){let u=h*(s+1),f=u+s;l.fromBufferAttribute(a,u).add(c.fromBufferAttribute(a,f)),l.lengthSq()>1e-12&&(l.normalize(),a.setXYZ(u,l.x,l.y,l.z),a.setXYZ(f,l.x,l.y,l.z))}a.needsUpdate=!0,i.boundingSphere=null,i.boundingBox=null}var pd=i=>i.reduce((e,t)=>[e[0]+t[0]/i.length,e[1]+t[1]/i.length,e[2]+t[2]/i.length],[0,0,0]);function V_(i){let e=[],n=new Hn(i.palm.size[0]*.01,i.palm.size[1]*.01,i.palm.size[2]*.01,2,.012);n.translate(...i.palm.c.map(s=>s*.01)),e.push(n);for(let s of[...i.fingers,i.thumb]){let r=s.pts.map(l=>Mi(l.map(c=>c*.01))),o=new En(new dn(r),Math.max(6,r.length*3),s.r*.01,7,!1);e.push(o);let a=new St(s.r*.01,8,6);a.translate(...s.pts.at(-1).map(l=>l*.01)),e.push(a)}return e}var Xc=i=>[i[0]/100,i[1]/100,i[2]/100];function G_(i){let e=[];for(let t of i.toes){let n=t.pts.map(o=>Mi(Xc(o)));e.push(new En(new dn(n),Math.max(6,n.length*3),t.r/100,8,!1));let s=new St(t.r/100,8,6);s.translate(...Xc(t.pts[0])),e.push(s);let r=new St(t.r/100,10,8);r.translate(...Xc(t.pts.at(-1))),e.push(r)}return e}function md(i,e,{skin:t,joint:n,sole:s,mesh:r}){let o=(...C)=>{let A=r(...C);return A.receiveShadow=!1,A.frustumCulled=!1,A},a=e.body,l={},c=new it;c.name="mannequin",i.add(c);let h=a.torso.length+1;l.torso={mesh:o(c,tl(h,a.torso[0].length),t,"torso")};for(let[C,A]of Object.entries(a.limbs))l[C]={mesh:o(c,tl(A.length-1,A[0].length),t,C)};l.neck={mesh:o(c,tl(a.neck.length-1,a.neck[0].length),t,"neck")};let u=new it;u.name="head",c.add(u);{let C=a.head.mesh,A=new st;A.setAttribute("position",new qe(new Float32Array(C.pts.flatMap(w=>w.map(P=>P/100))),3)),A.setAttribute("normal",new qe(new Float32Array(C.nrm.flat()),3)),A.setIndex(C.idx),A.computeBoundingSphere(),A.computeBoundingBox(),o(u,A,t,"skull");for(let w of Object.values(a.head.ears)){let P=o(u,new St(1,16,12),t,"ear");P.position.set(...w.c.map(S=>S/100)),P.quaternion.setFromRotationMatrix(new Qe().makeBasis(Mi(w.ax[0]),Mi(w.ax[1]),Mi(w.ax[2]))),P.scale.set(...w.r.map(S=>S/100))}}l.head={mesh:u};for(let C of a.caps)l["cap-"+C.key]={mesh:o(c,new St(1,16,12),t,"cap-"+C.key)};let f=new Map;for(let C of["L","R"]){let A=new it;A.name="hand"+C,c.add(A),l["hand"+C]={mesh:A,key:null};let w=e.body.feet[C],P=o(c,tl(w.rows.length-1,w.rows[0].length),t,"foot-rear"+C),S=new it;S.name="foot-toes"+C,c.add(S);for(let v of G_(w.shape))o(S,v,t,"toe"+C);l["foot-rear"+C]={mesh:P},l["foot-toes"+C]={mesh:S}}let p=new it;p.name="joint-dots",i.add(p);let _=new nn({color:"#e2f1ff",depthTest:!1,toneMapped:!1}),y=new nn({color:"#0e1520",depthTest:!1,toneMapped:!1}),m=new St(.021,10,8),d=new St(.031,10,8);for(let C of["L","R"])for(let A of["sh","el","wr","hip","kn","an"]){let w=o(p,m,_,A+C),P=new Ke(d,y);P.name="dot-ring",P.renderOrder=10,w.renderOrder=11,w.castShadow=w.receiveShadow=!1,w.add(P),l["dot"+A+C]={mesh:w}}function E(C,A){let w=l["hand"+C];if(w.key!==A.key){w.mesh.traverse(P=>{P.isMesh&&!f.has(P.geometry.uuid)&&P.geometry.dispose()}),w.mesh.clear();for(let P of V_(A.shape))o(w.mesh,P,t,"hand-part"+C);w.key=A.key}w.mesh.position.fromArray(mn(A.frame.o)),w.mesh.quaternion.copy(Wc(A.frame))}function x(C,A,w=!1){let P=C.body,S=C.pose,v=P.torso,R=pd(v.at(-1)),L=pd(v[0]),z=(H,V)=>H.map((j,G)=>[2*j[0]-V[G][0],2*j[1]-V[G][1],2*j[2]-V[G][2]]),Y=l.torso.mesh.geometry;nl(Y,[z(v[0],v[1]),...v,z(v.at(-1),v.at(-2))],mn,w);{let H=Y.attributes.position,V=v[0].length,j=(v.length+1)*(V+1);for(let G=0;G<=V;G++)H.setXYZ(G,...mn(L)),H.setXYZ(j+G,...mn(R));H.needsUpdate=!0,Y.boundingSphere=null,Y.boundingBox=null}for(let[H,V]of Object.entries(P.limbs))nl(l[H].mesh.geometry,V,mn,w);nl(l.neck.mesh.geometry,P.neck,mn,w),u.position.fromArray(mn(P.head.c)),u.quaternion.copy(Wc({x:P.head.axes[0],y:P.head.axes[1],z:P.head.axes[2]}));for(let H of P.caps){let V=l["cap-"+H.key].mesh;V.position.fromArray(mn(H.c)),V.scale.setScalar(H.r/100)}for(let H of["L","R"]){E(H,P.hands[H]),nl(l["foot-rear"+H].mesh.geometry,P.feet[H].rows,mn,w);{let V=P.feet[H].toes,j=l["foot-toes"+H].mesh;j.position.fromArray(mn(V.o)),j.quaternion.copy(Wc(V))}for(let V of["sh","el","wr","hip","kn","an"])l["dot"+V+H].mesh.position.fromArray(mn(S[V+H]))}p.visible=!!A.joints}function g(C,A){let w=C.pose;for(let P of["L","R"])for(let S of["sh","el","wr","hip","kn","an"])l["dot"+S+P].mesh.position.fromArray(mn(w[S+P]));p.visible=!!A.joints}return{group:c,parts:l,apply:x,dots:g}}var W_=186,qc=6,X_=`attribute float skelBone;
uniform highp sampler2D skelBones;`,q_=`void main() {
 int skelRow=int(skelBone+.5);
 vec4 skelA0=texelFetch(skelBones,ivec2(0,skelRow),0),skelA1=texelFetch(skelBones,ivec2(1,skelRow),0),skelA2=texelFetch(skelBones,ivec2(2,skelRow),0);`,Y_=`#include <beginnormal_vertex>
 {vec3 skelN0=texelFetch(skelBones,ivec2(3,skelRow),0).xyz,skelN1=texelFetch(skelBones,ivec2(4,skelRow),0).xyz,skelN2=texelFetch(skelBones,ivec2(5,skelRow),0).xyz;
  objectNormal=vec3(dot(skelN0,objectNormal),dot(skelN1,objectNormal),dot(skelN2,objectNormal));}`,Z_=`#include <begin_vertex>
 transformed=vec3(dot(skelA0.xyz,transformed)+skelA0.w,dot(skelA1.xyz,transformed)+skelA1.w,dot(skelA2.xyz,transformed)+skelA2.w);`;function gd(i,e,t){return i.onBeforeCompile=n=>{n.uniforms.skelBones={value:e},n.vertexShader=X_+`
`+n.vertexShader.replace("void main() {",q_).replace("#include <beginnormal_vertex>",Y_).replace("#include <begin_vertex>",Z_)},i.customProgramCacheKey=()=>t,i}function J_(i){let e=0,t=0;for(let u of i)e+=u.pos.length/3,t+=u.idx.length;let n=new Float32Array(e*3),s=new Float32Array(e*3),r=new Uint16Array(e),o=e>65535?new Uint32Array(t):new Uint16Array(t),a=[],l=0,c=0;i.forEach((u,f)=>{let p=new st;p.setAttribute("position",new qe(u.pos,3)),p.setIndex(new qe(u.idx,1)),p.computeVertexNormals(),p.computeBoundingBox(),n.set(u.pos,l*3),s.set(p.attributes.normal.array,l*3),r.fill(f,l,l+u.pos.length/3);for(let m=0;m<u.idx.length;m++)o[c++]=u.idx[m]+l;let{min:_,max:y}=p.boundingBox;a.push([_.x,_.y,_.z,y.x,y.y,y.z]),l+=u.pos.length/3,p.dispose()});let h=new st;return h.setAttribute("position",new qe(n,3)),h.setAttribute("normal",new qe(s,3)),h.setAttribute("skelBone",new qe(r,1)),h.setIndex(new qe(o,1)),{geometry:h,boxes:a}}function _d(i){let e=new it;e.name="skeleton",e.visible=!1,i.add(e);let t=null,n=null,s=null,r=null,o=null,a=[],l=[],c=null,h=null;function u(g){y();let C=g.bones.length;t=new mi(new Float32Array(qc*4*C),qc,C,sn,pn),t.minFilter=t.magFilter=Vt,t.generateMipmaps=!1,t.name="skeleton-bones",n=gd(new Yt({color:"#ece2cb",roughness:.62,metalness:0}),t,"skeleton-bones"),n.name="skeleton-bones",s=gd(new gi({depthPacking:ws}),t,"skeleton-bones-depth"),s.name="skeleton-bones-depth";let A=J_(g.bones);l=A.boxes,a=g.bones.map(w=>w.name+(w.side||"")),r=new Ke(A.geometry,n),r.name="bones",r.matrixAutoUpdate=!1,r.castShadow=!0,r.receiveShadow=!1,r.frustumCulled=!1,r.customDepthMaterial=s,Object.defineProperty(r.userData,"boundsPoints",{get:f,enumerable:!1,configurable:!0}),e.add(r),c=new Float32Array(C*12),h=null,o=g}function f(){return h||(h=[],l.forEach((g,C)=>{let A=C*12;for(let w of[g[0],g[3]])for(let P of[g[1],g[4]])for(let S of[g[2],g[5]])h.push(new F(c[A]*w+c[A+1]*P+c[A+2]*S+c[A+3],c[A+4]*w+c[A+5]*P+c[A+6]*S+c[A+7],c[A+8]*w+c[A+9]*P+c[A+10]*S+c[A+11]))}),h)}function p(g,C,A,w=globalThis.Skeleton.frames(C,A,g.bones)){o!==g&&u(g);let P=t.image.data,S=a.length;for(let v=0;v<S;v++){let R=v*12,L=c;L[R]=w[R]/100,L[R+1]=w[R+1]/100,L[R+2]=w[R+2]/100,L[R+3]=w[R+3]/100,L[R+4]=-w[R+4]/100,L[R+5]=-w[R+5]/100,L[R+6]=-w[R+6]/100,L[R+7]=(W_-w[R+7])/100,L[R+8]=w[R+8]/100,L[R+9]=w[R+9]/100,L[R+10]=w[R+10]/100,L[R+11]=w[R+11]/100;let z=v*qc*4;P.set(L.subarray(R,R+12),z);let Y=L[R],H=L[R+1],V=L[R+2],j=L[R+4],G=L[R+5],de=L[R+6],pe=L[R+8],ye=L[R+9],Me=L[R+10],Ee=G*Me-de*ye,Ze=de*pe-j*Me,Ge=j*ye-G*pe,ne=Y*Ee+H*Ze+V*Ge,re=ne?1/ne:0;P[z+12]=Ee*re,P[z+13]=Ze*re,P[z+14]=Ge*re,P[z+15]=0,P[z+16]=(V*ye-H*Me)*re,P[z+17]=(Y*Me-V*pe)*re,P[z+18]=(H*pe-Y*ye)*re,P[z+19]=0,P[z+20]=(H*de-V*G)*re,P[z+21]=(V*j-Y*de)*re,P[z+22]=(Y*G-H*j)*re,P[z+23]=0}t.needsUpdate=!0,h=null,e.visible=!0}function _(){e.visible=!1}function y(){r&&(r.geometry.dispose(),e.remove(r)),t?.dispose(),n?.dispose(),s?.dispose(),r=t=n=s=null}function m(){y(),o=null,a=[],l=[],c=null,h=null}function d(){t?.dispose()}function E(g){let C=a.indexOf(g);if(C<0||!c)return null;let A=C*12,w=c;return new Qe().set(w[A],w[A+1],w[A+2],w[A+3],w[A+4],w[A+5],w[A+6],w[A+7],w[A+8],w[A+9],w[A+10],w[A+11],0,0,0,1)}let x={group:e,update:p,hide:_,dispose:m,disposeTexture:d,matrixOf:E,get names(){return a.slice()},get meshes(){return r?[r]:[]},get material(){return n}};return e.userData.layer=x,x}var $_=1.5,Gr="#b98c86",vd={pecm1:"pec_clavicular",pecm2:"pec_sternal",pecm3:"pec_costal",trilong:"tri_long",trilat:"tri_lateral",trimed:"tri_medial",biclong:"bi_long",bicshort:"bi_short",recfem:"quad_rectus",vaslat:"quad_lateral",vasmed:"quad_medial",vasint:"quad_deep",bflh:"ham_lateral",semimem:"ham_medial",semiten:"ham_medial",gasmed:"calf_medial",gaslat:"calf_lateral",soleus:"soleus",glmax:"glute_max",glmed:"glute_lateral",glmin:"glute_lateral",trapsup:"trap_upper",trapmid:"trap_mid"};Object.assign(vd,{trapinf:"trap_lower",levscap:"lev_scap",bfsh:"ham_short",eo:"obl_ext",io:"obl_int",pecmin:"pec_minor",supsp:"cuff_sup",infsp:"cuff_ext",tmin:"cuff_ext",subsc:"cuff_int",brd:"brachiorad",fcr:"forearm_flex",fcu:"forearm_flex",pl:"forearm_flex",fds:"forearm_flex",fdp:"forearm_flex",fpl:"forearm_flex",pt:"forearm_flex",pq:"forearm_flex",ecrl:"forearm_ext",ecrb:"forearm_ext",ecu:"forearm_ext",edc:"forearm_ext",edm:"forearm_ext",eip:"forearm_ext",epl:"forearm_ext",epb:"forearm_ext",apl:"forearm_ext",sup:"forearm_ext"});var xd=new WeakMap;function K_(i){if(!i)return new Map;let e=xd.get(i);if(e)return e;e=new Map;for(let[t,n]of Object.entries(i))e.has(n.parent)||e.set(n.parent,[]),e.get(n.parent).push(t);return xd.set(i,e),e}function j_(i,e,t,n){let s=i.group||[];if(!s.length)return Gr;let r=l=>{let c=vd[i.part];return c&&t?.regions?.[c]?.parent===l?c:l},o=t?.selected&&t.selected!=="all"?t.selected:null;if(o&&!s.some(l=>r(l)===o||l===o))return Gr;if(t?.phases&&t.values){let l=t.sideValues?.[i.side]||t.values,c=K_(t.regions),h=0,u=!1;for(let f of s){if(t.values[f]===void 0)continue;u=!0;let p=r(f),_=p!==f||t.regions?.[f]?l[p]:void 0,y=_===void 0?(c.get(f)||[]).map(m=>l[m]).filter(Number.isFinite):[];h=Math.max(h,_??(y.length?Math.max(...y):l[f]??t.values[f]))}return u?n(h):Gr}let a=Math.max(0,...s.map(l=>e?.[l]||0));return a>=1?n(1):a>0?n(.55):Gr}var rn={muscles:null,only:null,frames:null,pos:null,nor:null},Q_=(i,e)=>{if(!i||!e||i.length!==e.length)return!1;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return!1;return!0},Ns=64,yd=2,ex=2/Ns+1e-9,Yc=16<<20,Yi=new Map,Us=0,Md=0;function tx(i,e){let t=Yi.get(i);return t&&t.data!==e&&(Us-=t.bytes,Yi.delete(i),t=null),t?Yi.delete(i):t={data:e,bins:new Array(Ns+1).fill(null),bytes:0},Yi.set(i,t),t}function nx(i,e,t,n){for(let[s,r]of Yi){if(Us+n.byteLength<=Yc||r===i)break;Yi.delete(s),Us-=r.bytes}Us+n.byteLength>Yc||i.bins[e]||(i.bins[e]={t,tape:n},i.bytes+=n.byteLength,Us+=n.byteLength)}function ix(i,e,t){let n=Math.min(Ns,Math.floor(e*Ns)),s=null,r=null;for(let a=Math.max(0,n-yd);a<=Math.min(Ns,n+yd);a++){let l=i.bins[a];if(l){if(Math.abs(l.t-e)<1e-7)return{memo:{a:l.tape,b:l.tape,w:0}};l.t<e?(!s||l.t>s.t)&&(s=l):(!r||l.t<r.t)&&(r=l)}}if(s&&r&&r.t-s.t<=ex)return{memo:{a:s.tape,b:r.tape,w:(e-s.t)/(r.t-s.t)}};if(i.bins[n])return null;let o=new Int16Array(t);return{memo:{rec:o},e:i,b:n,rec:o}}function Sd(){return{bytes:Us,figures:Yi.size,limit:Yc,phases:Ns,misses:Md}}var sx=186,rx=new Set(["trapmid","trapinf"]),ox=.02;function ax(i){return i.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
attribute float layer;`).replace("#include <project_vertex>",`#include <project_vertex>
 if(layer>0.){vec3 toCam=isOrthographic?vec3(0.,0.,1.):normalize(-mvPosition.xyz);mvPosition.xyz+=toCam*layer*`+ox.toFixed(3)+";gl_Position=projectionMatrix*mvPosition;}")},i.customProgramCacheKey=()=>"muscle-layer",i}function lx(i,e,t){let n=globalThis.Muscles,s=new Map;return(i.sheets||[]).forEach((r,o)=>{if(t&&!t.test(r.name))return;let a=e.bones.findIndex(l=>l.name===r.bone[0]&&(l.side||"")===(r.bone[1]||""));if(a<0)throw Error("muscles: no bone "+r.bone.join(" "));s.has(a)||s.set(a,[]),s.get(a).push([o,n.sheetMesh(r)])}),[...s].map(([r,o])=>{let a=o.reduce((_,[,y])=>_+y.n,0),l=new Float32Array(a*3),c=new Float32Array(a*3),h=[],u=[],f=0;for(let[_,y]of o){l.set(y.pos,f*3),c.set(y.nor,f*3);for(let m of y.idx)h.push(m+f);for(let m=0;m<y.idx.length/3;m++)u.push(_);f+=y.n}let p=new st;return p.setAttribute("position",new qe(l,3)),p.setAttribute("normal",new qe(c,3)),p.setIndex(a>65535?new pi(h,1):new fi(h,1)),{bone:r,geo:p,owner:u}})}function bd(i){let e=new it;e.name="muscles",e.visible=!1,i.add(e);let t=null,n=null,s=null,r=null,o=null,a=null,l=null,c=null,h=0,u=[],f=null,p=null;function _(S,v){for(let R of u)e.remove(R.mesh),R.geo.dispose();p||(p=new Yt({color:Gr,roughness:.55,metalness:0})),u=lx(S.muscles,S.skeleton,v).map(R=>{let L=new Ke(R.geo,p);return L.name="muscle-sheets",L.matrixAutoUpdate=!1,L.frustumCulled=!1,L.castShadow=!1,L.receiveShadow=!1,e.add(L),{...R,mesh:L}})}function y(S){for(let v of u){let R=v.bone*12,L=z=>S[R+z];v.mesh.matrix.set(L(0)/100,L(1)/100,L(2)/100,L(3)/100,-L(4)/100,-L(5)/100,-L(6)/100,(sx-L(7))/100,L(8)/100,L(9)/100,L(10)/100,L(11)/100,0,0,0,1),v.mesh.matrixWorldNeedsUpdate=!0}}let m=new Ve;function d(){let S=globalThis.Muscles;h=S.SIDES,l=S.ringStarts(r);let v=l[r.length]*h,R=[];c=[];for(let z=0;z<r.length;z++)for(let Y=l[z];Y<l[z+1]-1;Y++)for(let H=0;H<h;H++){let V=Y*h+H,j=Y*h+(H+1)%h,G=V+h,de=j+h;R.push(V,j,G,j,de,G),c.push(z,z)}n?.dispose(),n=new st,n.setAttribute("position",new qe(new Float32Array(v*3),3).setUsage(Ts)),n.setAttribute("normal",new qe(new Float32Array(v*3),3).setUsage(Ts)),n.setAttribute("color",new qe(new Float32Array(v*3),3));let L=new Float32Array(v);for(let z=0;z<r.length;z++)rx.has(r[z].part)&&L.fill(1,l[z]*h,l[z+1]*h);n.setAttribute("layer",new qe(L,1)),n.setIndex(v>65535?new pi(R,1):new fi(R,1)),s||(s=ax(new Yt({roughness:.55,metalness:0,vertexColors:!0}))),t&&e.remove(t),t=new Ke(n,s),t.name="muscle-bodies",t.frustumCulled=!1,t.castShadow=!1,t.receiveShadow=!1,e.add(t),a=new Array(r.length).fill(null)}function E(S,v,R){let L=n.attributes.color.array,z=!1;r.forEach((Y,H)=>{let V=j_(Y,S,v,R);if(a[H]!==V){a[H]=V,z=!0,m.set(V);for(let j=l[H]*h;j<l[H+1]*h;j++)L[j*3]=m.r,L[j*3+1]=m.g,L[j*3+2]=m.b}}),z&&(n.attributes.color.needsUpdate=!0)}function x(S,v,R,L=null,z=null){let Y=globalThis.Muscles,H=S.muscles;(o!==H||r?.skel!==S.skeleton)&&(r=Y.bind(H,S.skeleton),r.skel=S.skeleton,o=H,d()),E(S.level,L,R);let V=n.attributes.position.array,j=n.attributes.normal.array,G=S.only||null,de=[H,S.skeleton,G?G.source:""];if((!f||f.some((Me,Ee)=>Me!==de[Ee]))&&(_(S,G),f=de),y(v),rn.muscles===H&&!G&&!rn.only&&rn.pos?.length===V.length&&Q_(rn.frames,v)){V.set(rn.pos),j.set(rn.nor),g();return}let pe=z&&z.key&&r.tapeN&&z.t>=0&&z.t<=1?ix(tx(z.key,r),z.t,r.tapeN):null;z&&(!pe||pe.rec)&&Md++,Y.surfaceAll(r,Y.layoutDrawn(r,v,$_),v,V,j,l,pe?pe.memo:null),pe&&pe.rec&&nx(pe.e,pe.b,z.t,pe.rec);for(let Me=0;Me<V.length;Me+=3)V[Me]/=100,V[Me+1]=(186-V[Me+1])/100,V[Me+2]/=100,j[Me+1]=-j[Me+1];if(G)for(let Me=0;Me<r.length;Me++)G.test(r[Me].name)||V.fill(0,l[Me]*h*3,l[Me+1]*h*3);let ye=(Me,Ee)=>Me&&Me.length===Ee.length?(Me.set(Ee),Me):Float32Array.from(Ee);rn.muscles=H,rn.only=G,rn.frames=ye(rn.frames,v),rn.pos=ye(rn.pos,V),rn.nor=ye(rn.nor,j),g()}function g(){n.attributes.position.needsUpdate=!0,n.attributes.normal.needsUpdate=!0,n.boundingSphere=null,n.boundingBox=null,e.visible=!0}function C(){e.visible=!1}function A(){t&&e.remove(t),n?.dispose(),s?.dispose(),t=n=s=null,r=null,o=null;for(let S of u)e.remove(S.mesh),S.geo.dispose();u=[],f=null,p?.dispose(),p=null}function w(S){if(!e.visible||!t)return-1;n.computeBoundingSphere();let v=S.intersectObject(t,!1)[0];return v?c[v.faceIndex]:-1}function P(S){if(!e.visible||!t)return null;n.computeBoundingSphere();let v=null,R=S.intersectObject(t,!1)[0];R&&(v={muscle:c[R.faceIndex],distance:R.distance});for(let L of u){L.geo.boundingSphere||L.geo.computeBoundingSphere();let z=S.intersectObject(L.mesh,!1)[0];z&&(!v||z.distance<v.distance)&&(v={sheet:L.owner[z.faceIndex],distance:z.distance})}return v}return{group:e,update:x,hide:C,dispose:A,pick:w,pickAny:P,get mesh(){return t},get sheets(){return u.map(S=>S.mesh)}}}var il=186,cx=37,hx={ao:[.85,.35],relief:[.6,6],roughness:.72},ux=()=>({...hx,...globalThis.ANNY_LOOK||{}});function dx(i,e,t){let n=Math.atan2(i,t),s=97.5-Math.cos(n),r=i>=0?1:-1,o=Math.atan2((i-8.8*r)*r,t),a=85+1.5*Math.cos(o)+8*Math.sin(o);return Math.min(s-e,e-a)}var fx=new Set(["pelvis","lumbar","thorax","thL","thR"]);function px(i,e,t,n,s){if(!(n>0))return;let r=i.attributes.normal.array,o=Array.from({length:t},()=>new Set);for(let l=0;l<e.length;l+=3){let c=e[l],h=e[l+1],u=e[l+2];o[c].add(h).add(u),o[h].add(c).add(u),o[u].add(c).add(h)}let a=Float32Array.from(r);for(let l=0;l<s;l++){let c=new Float32Array(a.length);for(let h=0;h<t;h++){let u=a[h*3],f=a[h*3+1],p=a[h*3+2];for(let y of o[h])u+=a[y*3],f+=a[y*3+1],p+=a[y*3+2];let _=Math.hypot(u,f,p)||1;c[h*3]=u/_,c[h*3+1]=f/_,c[h*3+2]=p/_}a=c}for(let l=0;l<t;l++){let c=r[l*3]+n*(r[l*3]-a[l*3]),h=r[l*3+1]+n*(r[l*3+1]-a[l*3+1]),u=r[l*3+2]+n*(r[l*3+2]-a[l*3+2]),f=Math.hypot(c,h,u)||1;r[l*3]=c/f,r[l*3+1]=h/f,r[l*3+2]=u/f}i.attributes.normal.needsUpdate=!0}var Ed=`
uniform vec4 annyDQ[ANNY_FRAMES*2];
#define ANNY_FLOOR ${il.toFixed(1)}
attribute vec4 annyIndex;
attribute vec4 annyWeight;
void annyBlend(out vec4 r,out vec4 d){
 ivec4 ix=ivec4(annyIndex+.5);
 vec4 r0=annyDQ[ix.x*2];r=vec4(0.);d=vec4(0.);
 for(int k=0;k<4;k++){
  float w=annyWeight[k];if(w<=0.)continue;
  int i=ix[k];vec4 qr=annyDQ[i*2],qd=annyDQ[i*2+1];
  if(dot(qr,r0)<0.)w=-w;
  r+=w*qr;d+=w*qd;
 }
 float l=length(r);r/=l;d/=l;
}
vec3 annyRotate(vec4 q,vec3 p){return p+2.*cross(q.xyz,cross(q.xyz,p)+q.w*p);}
vec3 annyMove(vec4 r,vec4 d,vec3 p){return annyRotate(r,p)+2.*(r.w*d.xyz-d.w*r.xyz+cross(r.xyz,d.xyz));}
#ifdef ANNY_LBS
/* \u043B\u0438\u043D\u0435\u0439\u043D\u043E\u0435 \u0441\u043C\u0435\u0448\u0435\u043D\u0438\u0435 \u0442\u0435\u0445 \u0436\u0435 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0439 (\u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F \u043D\u0430 \u043B\u0438\u0441\u0442\u0430\u0445: globalThis.ANNY_METHOD = 'lbs') */
vec3 annyLinear(vec3 p,bool dir){
 ivec4 ix=ivec4(annyIndex+.5);vec3 o=vec3(0.);
 for(int k=0;k<4;k++){float w=annyWeight[k];if(w<=0.)continue;int i=ix[k];vec4 r=annyDQ[i*2],d=annyDQ[i*2+1];o+=w*(dir?annyRotate(r,p):annyMove(r,d,p));}
 return o;
}
#endif
`,mx=`attribute vec4 annyColor;
varying vec4 vAnnyColor;
`,gx=`
vAnnyColor=annyColor;`,Zc=i=>i===2?"vec2":"float",_x=i=>i?"attribute "+Zc(i)+` annyLook;
varying `+Zc(i)+` vAnnyLook;
`:"",xx=i=>i?"vAnnyLook=annyLook;":"";function wd(i,e,{normals:t=!0,color:n=!1,lookN:s=0}={}){let r=(n?mx:"")+_x(s),o=(n?gx:"")+xx(s);if(globalThis.ANNY_METHOD==="lbs"){i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
#define ANNY_LBS
#define ANNY_FRAMES `+e+`
`+Ed+r),t&&(i.vertexShader=i.vertexShader.replace("#include <skinnormal_vertex>","objectNormal=normalize(annyLinear(objectNormal,true));")),i.vertexShader=i.vertexShader.replace("#include <skinning_vertex>","transformed=annyLinear(transformed,false);transformed.y=min(transformed.y,ANNY_FLOOR);"+o);return}i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
#define ANNY_FRAMES `+e+`
`+Ed+r),t&&(i.vertexShader=i.vertexShader.replace("#include <skinnormal_vertex>",`vec4 annyR,annyD;annyBlend(annyR,annyD);objectNormal=annyRotate(annyR,objectNormal);
#ifdef USE_TANGENT
objectTangent=annyRotate(annyR,objectTangent);
#endif`)),i.vertexShader=i.vertexShader.replace("#include <skinning_vertex>",(t?"":`vec4 annyR,annyD;annyBlend(annyR,annyD);
`)+"transformed=annyMove(annyR,annyD,transformed);transformed.y=min(transformed.y,ANNY_FLOOR);"+o)}function Td(i,e){let t=new it;t.name="anny",t.visible=!1,i.add(t);let n=null,s=null,r=null,o=null,a=null,l=null,c="",h=null,u={value:.28};function f(d){m();let E=new st;E.setAttribute("position",new qe(d.pos,3));let x=new Uint16Array(d.idx.length);for(let v=0;v<x.length;v+=3)x[v]=d.idx[v],x[v+1]=d.idx[v+2],x[v+2]=d.idx[v+1];E.setIndex(new qe(x,1)),E.computeVertexNormals();let g=ux();px(E,x,d.nv,g.relief?.[0]??0,g.relief?.[1]??6);let C=new Ve(g.trunks?.color||"#000"),A=g.trunks?.alpha||0,w=(g.ao?.[0]||0)>0||(g.ao?.[1]||0)>0,P=A>0?2:w?1:0,S=P===2?"vAnnyLook.x":"vAnnyLook";if(E.setAttribute("annyIndex",new qe(Float32Array.from(d.wi),4)),E.setAttribute("annyWeight",new qe(d.ww,4)),l=new qe(new Uint8Array(d.nv*4),4,!0),l.setUsage(Ts),E.setAttribute("annyColor",l),P){let v=new Float32Array(d.nv*P);for(let R=0;R<d.nv;R++)if(v[R*P]=d.shade?d.shade[R]:1,P===2){let L=d.frames[d.wi[R*4]];v[R*2+1]=fx.has(L)?Math.max(-8,Math.min(8,dx(d.pos[R*3],il-d.pos[R*3+1],d.pos[R*3+2]))):-8}E.setAttribute("annyLook",new qe(v,P))}d.correctives.length&&(E.morphAttributes.position=d.correctives.map(v=>{let R=new Float32Array(d.nv*3);for(let L=0;L<v.n;L++){let z=v.i[L];R[z*3]=v.d[L*3],R[z*3+1]=v.d[L*3+1],R[z*3+2]=v.d[L*3+2]}return new qe(R,3)}),E.morphTargetsRelative=!0),E.boundingSphere=new Ln(new F,1e3),E.boundingBox=new tn(new F(-1e3,-1e3,-1e3),new F(1e3,1e3,1e3)),a={annyDQ:{value:new Float32Array(d.frames.length*8)}},r=e.clone(),r.name="anny-skin",r.side=Qt,r.roughness=g.roughness??e.roughness,a.annyAO={value:new be(g.ao?.[0]??0,g.ao?.[1]??0)},a.annyTrunk={value:new ot(C.r,C.g,C.b,A)},r.onBeforeCompile=v=>{v.uniforms.annyDQ=a.annyDQ,v.uniforms.annyGlow=u,v.uniforms.annyAO=a.annyAO,v.uniforms.annyTrunk=a.annyTrunk,wd(v,d.frames.length,{color:!0,lookN:P}),v.fragmentShader=v.fragmentShader.replace("#include <common>",`#include <common>
varying vec4 vAnnyColor;
`+(P?"varying "+Zc(P)+` vAnnyLook;
`:"")+`uniform float annyGlow;
uniform vec2 annyAO;
uniform vec4 annyTrunk;
vec3 annyLinear(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(.04045,c));}`).replace("#include <color_fragment>",`#include <color_fragment>
`+(A>0?`float annyFw=max(fwidth(vAnnyLook.y)*.75,1e-3);if(vAnnyLook.y>-annyFw)diffuseColor.rgb=mix(diffuseColor.rgb,annyTrunk.rgb,smoothstep(-annyFw,annyFw,vAnnyLook.y)*annyTrunk.a);
`:"")+"vec3 annyZone=vec3(0.);if(vAnnyColor.a>0.){annyZone=annyLinear(vAnnyColor.rgb);diffuseColor.rgb=mix(diffuseColor.rgb,annyZone,vAnnyColor.a);}").replace("#include <aomap_fragment>",`#include <aomap_fragment>
`+(w?"reflectedLight.indirectDiffuse*=mix(1.,"+S+",annyAO.x);float annyDir=mix(1.,"+S+",annyAO.y);reflectedLight.directDiffuse*=annyDir;reflectedLight.directSpecular*=annyDir;":"")).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance+=annyZone*annyGlow*vAnnyColor.a;`)},r.customProgramCacheKey=()=>"anny-skin-"+d.frames.length+(A>0?"-trunks":"")+(w?"-ao":"")+(globalThis.ANNY_METHOD||""),o=new gi({depthPacking:ws}),o.onBeforeCompile=v=>{v.uniforms.annyDQ=a.annyDQ,wd(v,d.frames.length,{normals:!1})},o.customProgramCacheKey=()=>"anny-depth-"+d.frames.length+(globalThis.ANNY_METHOD||""),s=new Ke(E,r),s.name="anny-skin",s.customDepthMaterial=o,s.castShadow=!0,s.receiveShadow=!1,s.frustumCulled=!1,s.matrixAutoUpdate=!1,s.matrix.set(.01,0,0,0,0,-.01,0,il/100,0,0,.01,0,0,0,0,1),d.correctives.length&&(s.morphTargetInfluences=new Array(d.correctives.length).fill(0)),t.add(s),n=d,c="",h=[];for(let v=0;v<d.nv;v+=cx)h.push(v)}function p(d,E,x){n!==d&&f(d);let g=globalThis.AnnySkin,C=E.pose,A=g.skinMats(C,d),w=g.correctiveWeights(C,d);a.annyDQ.value.set(g.dualQuats(A,d.frames.length)),s.morphTargetInfluences&&w.forEach((v,R)=>{s.morphTargetInfluences[R]=v}),_(d,x);let P=g.skin(C,{d,only:h,corr:w}),S=[];for(let v=0;v<h.length;v++)S.push(new F(P[v*3]/100,(il-P[v*3+1])/100,P[v*3+2]/100));return s.userData.boundsPoints=S,t.visible=!0,s}function _(d,E){let x=E?.on?globalThis.AnnySkin.regions(d):null,g=x?x.ids:[],C=[],A="";for(let R of g)for(let L of["L","R"]){let z=E.regions?.[R],V=!!z?.visible&&(!E.selected||E.selected==="all"||E.selected===R||E.selected===z.parent)?E.color(E.sideValues?.[L]?.[R]??E.values?.[R]??.28):null;C.push(V),A+=(V||"-")+"|"}if(A===c)return;c=A;let w=new Ve,P={},S=C.map(R=>R?(w.set(R).getRGB(P,It),[Math.round(P.r*255),Math.round(P.g*255),Math.round(P.b*255),255]):[0,0,0,0]),v=l.array;if(v.fill(0),x)for(let R=0;R<d.nv;R++){let L=x.rid[R];if(!L)continue;let z=S[(L-1)*2+d.region.side[R]];z[3]&&(v[R*4]=z[0],v[R*4+1]=z[1],v[R*4+2]=z[2],v[R*4+3]=255)}l.needsUpdate=!0}function y(){t.visible=!1}function m(){s&&(s.geometry.dispose(),t.remove(s)),r?.dispose(),o?.dispose(),s=r=o=null,n=null}return{group:t,update:p,hide:y,dispose:m,setGlow(d){u.value=d},get mesh(){return s}}}var gn=i=>[i[0]/100,(186-i[1])/100,i[2]/100],Bs=i=>[i[0],-i[1],i[2]],Zi=i=>new F(...i),Fs=(i,e)=>[i[0]-e[0],i[1]-e[1],i[2]-e[2]],Os=(i,e,t=1)=>[i[0]+e[0]*t,i[1]+e[1]*t,i[2]+e[2]*t],$c=i=>Math.hypot(...i),Tn=i=>{let e=$c(i)||1;return i.map(t=>t/e)},yx=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2],Jc=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],vx=new Set(["beam","obox","cyl","sphere","cable","prism"]),Wr=i=>vx.has(i.kind)||i.kind==="barbell"&&i.len||i.kind==="dumbbell"&&i.handle||i.kind==="kettlebell"&&i.handleAxis;function Kc(i){return i.kind+(i.kind==="barbell"?JSON.stringify(i.plates||[]):"")+(i.kind==="cable"?":"+i.pts.length:"")+(i.kind==="beam"?i.r?":r":":w":"")+(i.kind==="cyl"?":"+(i.sides||24):"")+(i.kind==="prism"?":"+Mx(i):"")}var Mx=i=>i.pts.length+":"+i.len+":"+i.pts.reduce((e,t)=>e+t[0]*1.7+t[1]*2.3,0).toFixed(3);function Sx(i){let e=new xs(i.pts.map(n=>new be(n[0]/100,n[1]/100))),t=new Tr(e,{depth:i.len/100,bevelEnabled:!1,curveSegments:1});return t.translate(0,0,-i.len/200),t.computeVertexNormals(),t}function sl(i,e,t){let n=Tn(Bs(i)),s=Tn(Bs(e)),r=Jc(n,s);return new Ot().setFromRotationMatrix(new Qe().makeBasis(Zi(n),Zi(s),Zi(r)))}var rl=new F(0,1,0);function Ad(i,e,t){let n=Fs(t,e),s=$c(n);return i.visible=s>1e-4,i.visible?(i.position.fromArray(gn(Os(e,n,.5))),i.quaternion.setFromUnitVectors(rl,Zi(Tn(Bs(n)))),s):0}var Rd=i=>i.size.map(e=>e.toFixed(2)).join(",")+":"+(i.round??.6);function Cd(i){let[e,t,n]=i.size.map(r=>Math.max(.05,r)/100),s=Math.min((i.round??.6)/100,Math.min(e,t,n)*.45);return new Hn(e,t,n,s>.004?3:1,Math.max(1e-4,s))}function Id(i,e,t,n){let s=new it;s.name="prop-"+e.kind+(e.id?":"+e.id:""),i.add(s);let r=t[e.tone]||t.frame||t.steel;if(e.kind==="beam")e.r?n(s,new gt(1,1,1,16),r,"beam"):n(s,new Hn(1,1,1,2,.08),r,"beam");else if(e.kind==="obox"){let o=n(s,Cd(e),r,"box");o.userData.size=Rd(e)}else if(e.kind==="cyl")n(s,new gt(1,1,1,e.sides||24),r,"cyl");else if(e.kind==="sphere")n(s,new St(1,18,12),r,"sphere");else if(e.kind==="prism")n(s,Sx(e),r,"prism");else if(e.kind==="cable")for(let o=1;o<e.pts.length;o++)n(s,new gt(1,1,1,8),r,"cable");else if(e.kind==="barbell"){n(s,new gt(1,1,1,18),t.chrome,"shaft");for(let o of[-1,1])n(s,new gt(1,1,1,18),t.chrome,"sleeve").userData.sign=o,n(s,new gt(1,1,1,18),t.chrome,"collar").userData.sign=o,(e.plates||[]).forEach((a,l)=>{let c=n(s,new gt(1,1,1,32),t.plate,"plate");c.userData={sign:o,i:l}})}else if(e.kind==="kettlebell"){n(s,new St(1,24,16),t.plate,"bell").scale.set(1,.94,1);let a=[[-7.2,6.5],[-9.2,11],[-8.4,14.6],[-5,15.6],[5,15.6],[8.4,14.6],[9.2,11],[7.2,6.5]].map(([c,h])=>new F(c/10.5,h/10.5,0));n(s,new En(new dn(a),40,.16,10,!1),t.plate,"handle"),n(s,new gt(.62,.62,.06,24),t.plate,"base").position.set(0,-.92,0)}else if(e.kind==="dumbbell"){n(s,new gt(1,1,1,14),t.chrome,"handle");for(let o of[-1,1])n(s,new gt(1,1,1,6),t.plate,"head").userData.sign=o,n(s,new gt(1,1,1,14),t.chrome,"inner").userData.sign=o}return{group:s,kind:e.kind,key:Kc(e)}}function Pd(i,e){let t=i.group,n=t.children;if(t.visible=!0,e.kind==="beam"){let s=n[0],r=Ad(s,e.a,e.b);if(e.r)s.scale.set(e.r/100,r/100,e.r/100);else{let o=Tn(Fs(e.b,e.a)),a=Fs(e.up||[0,-1,0],o.map(c=>c*yx(e.up||[0,-1,0],o)));$c(a)<1e-6&&(a=Math.abs(o[2])<.9?Fs([0,0,1],o.map(c=>c*o[2])):Fs([1,0,0],o.map(c=>c*o[0]))),a=Tn(a);let l=Jc(o,a);s.quaternion.copy(sl(l,o,a)),s.scale.set(e.w/100,r/100,e.h/100)}}else if(e.kind==="obox"){let s=n[0],r=Rd(e);s.userData.size!==r&&(s.geometry.dispose(),s.geometry=Cd(e),s.userData.size=r),s.position.fromArray(gn(e.c)),s.quaternion.copy(sl(e.x,e.y,e.z)),s.scale.set(1,1,1)}else if(e.kind==="cyl"){let s=n[0];s.position.fromArray(gn(e.c)),s.quaternion.setFromUnitVectors(rl,Zi(Tn(Bs(e.axis)))),s.scale.set(e.r/100,e.len/100,e.r/100)}else if(e.kind==="sphere"){let s=n[0];s.position.fromArray(gn(e.c)),s.scale.setScalar(e.r/100)}else if(e.kind==="prism"){let s=n[0];s.position.fromArray(gn(e.c)),s.quaternion.copy(sl(e.u,e.v,e.w))}else if(e.kind==="cable")for(let s=1;s<e.pts.length;s++){let r=n[s-1],o=Ad(r,e.pts[s-1],e.pts[s]);r.scale.set(e.r/100,o/100,e.r/100)}else if(e.kind==="barbell"){let s=Tn(e.axis),r=e.c,o=new Ot().setFromUnitVectors(rl,Zi(Tn(Bs(s))));for(let a of n){a.quaternion.copy(o);let l=a.userData.sign;if(a.name==="shaft")a.position.fromArray(gn(r)),a.scale.set(e.shaftR/100,2*e.inner/100,e.shaftR/100);else if(a.name==="collar")a.position.fromArray(gn(Os(r,s,l*(e.inner+1)))),a.scale.set(3.6/100,2/100,3.6/100);else if(a.name==="sleeve"){let c=e.inner+2,h=e.len/2;a.position.fromArray(gn(Os(r,s,l*(c+h)/2))),a.scale.set(e.sleeveR/100,(h-c)/100,e.sleeveR/100)}else if(a.name==="plate"){let c=e.inner+2.4;for(let f=0;f<a.userData.i;f++)c+=e.plates[f][1]+.3;let[h,u]=e.plates[a.userData.i];a.position.fromArray(gn(Os(r,s,l*(c+u/2)))),a.scale.set(h/100,u/100,h/100)}}}else if(e.kind==="kettlebell"){let s=Tn(Fs(e.grip,e.c)),r=Tn(e.handleAxis),o=Jc(r,s);t.position.fromArray(gn(e.c)),t.quaternion.copy(sl(r,s,o)),t.scale.setScalar(e.radius/100)}else if(e.kind==="dumbbell"){let s=Tn(e.axis),r=e.c,o=new Ot().setFromUnitVectors(rl,Zi(Tn(Bs(s))));for(let a of n){a.quaternion.copy(o);let l=a.userData.sign;a.name==="handle"?(a.position.fromArray(gn(r)),a.scale.set(1.6/100,(e.handle+2)/100,1.6/100)):a.name==="inner"?(a.position.fromArray(gn(Os(r,s,l*(e.handle/2+.6)))),a.scale.set(2.6/100,1.2/100,2.6/100)):(a.position.fromArray(gn(Os(r,s,l*(e.handle/2+1.2+e.headLen/2)))),a.scale.set(e.headR/100,e.headLen/100,e.headR/100))}}}var bt=(i,e,t=1)=>i.map((n,s)=>n+e[s]*t),kt=(i,e)=>i.map((t,n)=>t-e[n]),ll=(i,e)=>i.reduce((t,n,s)=>t+n*e[s],0),ti=i=>Math.hypot(...i),Zt=i=>{let e=ti(i);if(e<1e-8)throw Error("Degenerate scene direction");return i.map(t=>t/e)},ni=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],Nt=i=>[i[0]/100,(186-i[1])/100,i[2]/100],on=i=>[i[0],-i[1],i[2]],Si=i=>new F(...i),qr={above:[35,-55],angle:[55,-15],side:[90,0],front:[0,0],back:[180,0],rear:[235,-15]};function jc(i,e,t){let n=Zt(kt(e,i)),s=kt(t,n.map(r=>r*ll(t,n)));return ti(s)<1e-5&&(s=ni(n,Math.abs(n[0])<.8?[1,0,0]:[0,0,1])),s=Zt(s),{x:s,y:Zt(ni(n,s)),z:n}}function al(i,e,t){return new Ot().setFromRotationMatrix(new Qe().makeBasis(Si(i),Si(e),Si(t)))}function Ct(i,{roughness:e=.6,metalness:t=0}={}){return new Yt({color:i,roughness:e,metalness:t,side:Bt})}function ft(i,e,t,n){let s=new Ke(e,t);return s.name=n,s.castShadow=!0,s.receiveShadow=!0,i.add(s),s}var Ut={background:["#1b2636","#0b1119"],floor:["#44536b","#111925"],hemi:[15002871,3818066,2.1],key:[16773600,1.9,[-2.2,5.2,3.2]],fill:[12374783,.9,[3.4,1.6,2.4]],rim:[14214911,1.5,[1.2,3.2,-4.6]],environment:0,shadow:"pcf",exposure:.93,muscleGlow:.28},Ji={core:.03,rim:.62,power:2.2,color:"#cfdbec",order:4};function bx(){let i=new Yt({color:Ji.color,roughness:.7,metalness:0,transparent:!0,depthWrite:!1,side:Bt}),e=t=>t.toFixed(4);return i.onBeforeCompile=t=>{t.fragmentShader=t.fragmentShader.replace("#include <opaque_fragment>",`
   vec3 ghostView=isOrthographic?vec3(0.,0.,1.):normalize(vViewPosition);
   float ghostRim=pow(1.-clamp(abs(dot(normalize(normal),ghostView)),0.,1.),${e(Ji.power)});
   gl_FragColor=vec4(outgoingLight,${e(Ji.core)}+${e(Ji.rim-Ji.core)}*ghostRim);`)},i.name="ghost-skin",i.customProgramCacheKey=()=>"ghost-skin",i.forceSinglePass=!0,i}function Ex(i,e,t=128){let n=new Ve(i),s=new Ve(e),r=new Uint8Array(t*t*4),o=new Ve;for(let l=0;l<t;l++)for(let c=0;c<t;c++){let h=Math.min(1,Math.hypot(c/(t-1)-.5,l/(t-1)-.5)*2),u=h*h*(3-2*h);o.copy(n).lerp(s,u);let f=(l*t+c)*4;r[f]=Math.round(o.r*255),r[f+1]=Math.round(o.g*255),r[f+2]=Math.round(o.b*255),r[f+3]=255}let a=new mi(r,t,t);return a.colorSpace=It,a.magFilter=en,a.minFilter=en,a.needsUpdate=!0,a}function wx(i,e,t,n){let s=[],r=[],o=i/2,a=i/e,l=new Ve(t),c=(f,p)=>Math.max(0,1-Math.hypot(f,p)/o)**1.6;for(let f=0;f<=e;f++){let p=-o+f*a;for(let _=0;_<e;_++){let y=-o+_*a,m=y+a;s.push(p,0,y,p,0,m,y,0,p,m,0,p);for(let[d,E]of[[p,y],[p,m],[y,p],[m,p]])r.push(l.r,l.g,l.b,c(d,E))}}let h=new st;h.setAttribute("position",new ut(s,3)),h.setAttribute("color",new ut(r,4));let u=new fr(h,new $n({vertexColors:!0,transparent:!0,opacity:.55,depthWrite:!1}));return u.name="floor-grid",u.position.set(...n),u}function Qc(i,e){let t=new st,n=[];t.setAttribute("position",new qe(new Float32Array((i+1)*(e+1)*3),3));for(let s=0;s<i;s++)for(let r=0;r<e;r++){let o=s*(e+1)+r,a=o+1,l=o+e+1;n.push(o,l,a,a,l,l+1)}return t.setIndex(n),t}function eh(i,e,t,n){let s=i.attributes.position,r=0;for(let o=0;o<=e;o++)for(let a=0;a<=t;a++){let l=Nt(n(o/e,a/t));s.setXYZ(r++,...l)}s.needsUpdate=!0,i.computeVertexNormals(),i.computeBoundingSphere(),i.computeBoundingBox()}function Tx(i,e){return e>18&&i.waist?bt(i.waist,i.chestU||i.u,e-18):bt(i.hip,i.u,e)}function Ld(i,e){for(let t=1;t<i.length;t++)if(e<=i[t][0]){let n=i[t-1],s=i[t],r=(e-n[0])/(s[0]-n[0]);return[n[1]+(s[1]-n[1])*r,n[2]+(s[2]-n[2])*r]}return i.at(-1).slice(1)}function ol(i,e,t){i.position.fromArray(Nt(e)),i.scale.set(...t.map(n=>n/100))}function Xr(i,e,t,n){let s=kt(t,e),r=ti(s);i.visible=r>1e-5,i.visible&&(i.position.fromArray(Nt(bt(e,t).map(o=>o/2))),i.scale.set(n/200,r/100,n/200),i.quaternion.setFromUnitVectors(new F(0,1,0),Si(on(Zt(s)))))}function Ax(i,e,t){let n=i["grip"+e],s=[];for(let a of t){let l,c,h,u=0;if(["dumbbell","barbell"].includes(a.kind))l=a.c,c=a.axis||[1,0,0],h=a.kind==="dumbbell"?6:40,u=1;else if(a.kind==="kettlebell"&&a.grip)l=a.grip,c=a.axis||[1,0,0],h=8,u=1;else if(a.kind==="line"&&a.equipmentRole==="grip"&&(!a.side||a.side===e))l=bt(a.a,a.b).map(y=>y/2),c=kt(a.b,a.a),h=ti(c)/2,u=2;else continue;if(ti(c)<1e-8)continue;c=Zt(c);let f=kt(n,l),p=ll(f,c),_=ti(kt(f,c.map(y=>y*p)));Math.abs(p)<=h+2&&_<5&&s.push({axis:c,distance:_,priority:u})}s.sort((a,l)=>l.priority-a.priority||a.distance-l.distance);let r=Zt(kt(n,i["wr"+e]));if(s.length)return s[0].axis;let o=kt(i.x,r.map(a=>a*ll(i.x,r)));return ti(o)<1e-5&&(o=ni(r,Math.abs(r[0])<.8?[1,0,0]:[0,0,1])),Zt(o)}var ks=i=>!i.dyn&&Wr(i);function th(i,e){if(i===e)return!0;if(Array.isArray(i)){if(!Array.isArray(e)||i.length!==e.length)return!1;for(let n=0;n<i.length;n++)if(!th(i[n],e[n]))return!1;return!0}if(!i||!e||typeof i!="object"||typeof e!="object"||Array.isArray(e))return!1;let t=Object.keys(i);if(t.length!==Object.keys(e).length)return!1;for(let n of t)if(!th(i[n],e[n]))return!1;return!0}function Rx(i){let e=0,t=0;for(let u of i){let f=u.geometry;e+=f.attributes.position.count,t+=f.index?f.index.count:f.attributes.position.count}let n=new Float32Array(e*3),s=new Float32Array(e*3),r=e>65535?new Uint32Array(t):new Uint16Array(t),o=new F,a=new Ye,l=0,c=0;for(let u of i){let f=u.geometry,p=f.attributes.position,_=f.attributes.normal,y=u.matrixWorld,m=y.determinant()<0,d=f.index;a.getNormalMatrix(y);for(let g=0;g<p.count;g++)o.fromBufferAttribute(p,g).applyMatrix4(y),n[(l+g)*3]=o.x,n[(l+g)*3+1]=o.y,n[(l+g)*3+2]=o.z,o.fromBufferAttribute(_,g).applyMatrix3(a).normalize(),s[(l+g)*3]=o.x,s[(l+g)*3+1]=o.y,s[(l+g)*3+2]=o.z;let E=d?d.count:p.count,x=g=>l+(d?d.getX(g):g);for(let g=0;g+2<E;g+=3)r[c++]=x(g),m?(r[c++]=x(g+2),r[c++]=x(g+1)):(r[c++]=x(g+1),r[c++]=x(g+2));l+=p.count}let h=new st;return h.setAttribute("position",new qe(n,3)),h.setAttribute("normal",new qe(s,3)),h.setIndex(new qe(r.subarray(0,c),1)),h.computeBoundingSphere(),h.computeBoundingBox(),h}function Cx(i,e,t,n){let s=e["grip"+t],r=Ax(e,t,n),o=Zt(kt(s,e["wr"+t])),a=kt(o,r.map(c=>c*ll(o,r)));ti(a)<1e-5&&(a=ni(r,Math.abs(r[1])<.8?[0,1,0]:[0,0,1])),a=Zt(a);let l=Zt(ni(r,a));i.position.fromArray(Nt(s)),i.quaternion.copy(al(on(r),on(a),on(l).map(c=>-c)))}function cl(i,{coarse:e=!1}={}){let t=e?5:10,n=e?8:16,s=e?12:24,r=new Jn;r.background=new Ve(Ut.background[1]);let o=Ct("#a0adc0",{roughness:.62}),a=Ct("#96a4b8",{roughness:.6}),l=Ct("#46546d",{roughness:.86}),c=Ct("#323c4c",{roughness:.78}),h={steel:Ct("#6a7fa2",{roughness:.42,metalness:.25}),bar:Ct("#d3dbe6",{roughness:.26,metalness:.5}),pad:Ct("#3c4a62",{roughness:.66}),plate:Ct("#3d506b",{roughness:.5,metalness:.15}),cable:Ct("#8494aa",{roughness:.35,metalness:.4}),band:Ct("#6f9fc7",{roughness:.7}),mat:Ct("#2a3a52",{roughness:.95}),frame:Ct("#7186a7",{roughness:.45,metalness:.25}),chrome:Ct("#dde4ee",{roughness:.24,metalness:.5}),rubber:Ct("#2b3341",{roughness:.95}),wood:Ct("#7a6450",{roughness:.78}),wall:Ct("#2a3546",{roughness:.92}),stack:Ct("#53668a",{roughness:.4,metalness:.3}),rope:Ct("#b8a07a",{roughness:.92}),towel:Ct("#c9cfd8",{roughness:1})},u=new Cr(Ut.hemi[0],Ut.hemi[1],Ut.hemi[2]);r.add(u);let f=(M,U,k)=>{let D=new Pr(M,U);return D.position.set(...k),r.add(D),r.add(D.target),D},p=f(...Ut.key),_=f(...Ut.fill),y=f(...Ut.rim);p.name="key-light",_.name="fill-light",y.name="rim-light";let m=Ex(...Ut.floor),d=ft(r,new Oi(12,12),new Yt({map:m,roughness:.94,metalness:0}),"floor");d.rotation.x=-Math.PI/2,d.position.y=-.014,d.castShadow=!1,d.position.z=.6;let E=wx(5,20,4742006,[0,-.01,1]);r.add(E);let x=i.body?md(r,i,{skin:o,joint:a,sole:c,mesh:ft}):null,g=x?x.parts:{},C=x?x.parts.torso.mesh:null,A=x?x.parts.head.mesh:null,w,P,S,v=x?Td(r,o):null,R=!1,L=_d(r),z=bd(r),Y=!1,H=bx(),V=new nn({name:"ghost-depth",colorWrite:!1,depthWrite:!0,transparent:!0,side:Bt,forceSinglePass:!0});function j(M){Y=M;let U=[];x.group.traverse(k=>{k.isMesh&&!k.userData.ghostTwin&&U.push(k)});for(let k of U){k.userData.skin||(k.userData.skin=k.material),k.material=M?H:k.userData.skin,k.castShadow=!M,k.renderOrder=M?Ji.order+1:0;let D=k.userData.twin;M&&!D&&(D=new Ke(k.geometry,V),D.name="ghost-depth",D.userData.ghostTwin=!0,D.castShadow=D.receiveShadow=!1,D.renderOrder=Ji.order,k.add(D),k.userData.twin=D),D&&(D.visible=M,D.geometry=k.geometry,D.frustumCulled=k.frustumCulled)}}if(!x){C=ft(r,Qc(i.torsoRings.length-1,s),o,"torso"),A=ft(r,new St(1,18,12),o,"head"),w=ft(r,new St(1,10,8),a,"nose"),P=ft(r,new gt(1,1,1,12),o,"neck"),S=new it,S.name="joint-dots",r.add(S);let M=new nn({color:"#e2f1ff",depthTest:!1,toneMapped:!1});for(let U of["L","R"]){for(let[ee,ge,ae]of[["ua","sh","el"],["fa","el","wr"],["th","hip","kn"],["sh","kn","an"]])g[ee+U]={a:ge+U,b:ae+U,mesh:ft(r,Qc(t,n),o,ee+U)};for(let[ee,ge]of[["sh",6.4],["el",4.3],["wr",2.7],["kn",5.2]])g[ee+"-joint"+U]={r:ge,mesh:ft(r,new St(1,14,10),a,ee+"-joint"+U)};let k=new it;k.name="hand"+U,r.add(k),ft(k,new St(1,14,10),o,"palm"+U).scale.set(.039,.034,.026);for(let ee=0;ee<4;ee++){let ge=Array.from({length:10},(ae,ie)=>{let Ae=-2+ie/9*4.65;return new F((ee-1.5)*.017,.021*Math.cos(Ae),.021*Math.sin(Ae))});ft(k,new En(new dn(ge),12,.0065,5,!1),o,"finger")}let B=U==="L"?-1:1,le=[[B*.028,-.018,-.017],[B*.043,.01,-.02],[B*.031,.023,.004]].map(ee=>Si(ee));ft(k,new En(new dn(le),8,.008,6,!1),o,"thumb");let N=ft(r,new Hn(1,1,1,2,.04),c,"shoe"+U);g["hand"+U]={mesh:k},g["shoe"+U]={mesh:N};let $=ft(r,Qc(2,16),l,"shorts"+U);g["shorts"+U]={mesh:$};for(let ee of["sh","el","wr","hip","kn","an"]){let ge=ft(S,new St(.021,8,6),M,ee+U);g["dot"+ee+U]={mesh:ge}}}}let G=new Map,de=new it;de.name="regions",r.add(de);let pe=new it;pe.name="equipment",r.add(pe);let ye=[],Me,Ee={},Ze=new it;Ze.name="equipment-static-parts",Ze.visible=!1,Ze.userData.drawnMerged=!0,r.add(Ze);let Ge=new it;Ge.name="equipment-static",r.add(Ge);let ne=null;function re(M){Ge.traverse(k=>k.geometry?.dispose()),Ge.clear();let U=new Map;ye.forEach((k,D)=>{ks(M[D])&&k.group.traverse(B=>{B.isMesh&&B.visible&&(U.has(B.material)||U.set(B.material,[]),U.get(B.material).push(B))})});for(let[k,D]of U){let B=ft(Ge,Rx(D),k,"static-"+D.length);B.userData.merged=!0,B.userData.sources=D}ne=M.map(k=>ks(k)?k:null)}let Te=new it;Te.name="joint-stress",r.add(Te);let Ne=new St(1,18,12),Pe=new nn({color:"#ff3b30",transparent:!0,opacity:.36,depthTest:!1,depthWrite:!1,toneMapped:!1}),Je=new nn({color:"#ff453a",depthTest:!1,depthWrite:!1,toneMapped:!1}),je=[],O=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;function ce(M){for(;je.length<=M;){let U=new it;U.name="stress-mark";let k=new Ke(Ne,Pe),D=new Ke(Ne,Je);k.renderOrder=20,D.renderOrder=21,D.scale.setScalar(.03),U.add(k,D),Te.add(U),je.push(U)}return je[M]}function oe(M){let U=O?1:1+.18*Math.sin((typeof performance<"u"?performance.now():0)/170);M.forEach((k,D)=>{let B=ce(D);B.visible=!0,B.position.fromArray(Nt(k.p)),B.children[0].scale.setScalar(.078*U)});for(let k=M.length;k<je.length;k++)je[k].visible=!1}function te(M,U){if(Wr(M))return Id(ks(M)?Ze:pe,M,h,ft);let k=new it;k.name="prop-"+U+"-"+M.kind,pe.add(k);let D=h[M.tone]||h.steel;if(M.kind==="box"||M.kind==="panel")ft(k,new Hn(1,1,1,2,.012),D,"pad");else if(M.kind==="line")ft(k,new gt(1,1,1,12),D,"beam");else if(["wheel","roller","weight"].includes(M.kind))ft(k,new gt(1,1,1,18),M.kind==="weight"?h.plate:D,"cylinder");else if(["barbell","dumbbell"].includes(M.kind)){ft(k,new gt(1,1,1,18),h.bar,"shaft");for(let B of[-1,1]){let le=ft(k,new gt(1,1,1,20),h.plate,"plate");le.userData.sign=B;let N=ft(k,new gt(1,1,1,12),h.bar,"collar");if(N.userData.sign=B,M.kind==="barbell"){let $=ft(k,new gt(1,1,1,16),h.bar,"sleeve");$.userData.sign=B}}}else if(M.kind==="kettlebell"){let B=ft(k,new St(1,18,12),h.plate,"kettlebell-body"),le=Array.from({length:13},(N,$)=>new F(-.055+$/12*.11,.042*Math.sin(Math.PI*$/12),0));ft(k,new En(new dn(le),14,.008,7,!1),h.bar,"kettlebell-handle")}else throw Error("Unknown scene prop "+M.kind);return{group:k,kind:M.kind,key:M.kind}}function se(M,U){if(Wr(U))return Pd(M,U);let k=M.group,D=U.c,B=U.axis||[1,0,0];if(k.visible=!0,U.kind==="box"){let le=k.children[0],N=kt(U.hi,U.lo);le.position.fromArray(Nt(bt(U.lo,U.hi).map($=>$/2))),le.scale.set(...N.map($=>Math.max(.002,$/100)))}else if(U.kind==="line")Xr(k.children[0],U.a,U.b,U.width);else if(U.kind==="panel"){let le=k.children[0],N=jc(U.a,U.b,[1,0,0]);le.position.fromArray(Nt(bt(U.a,U.b).map($=>$/2))),le.quaternion.copy(al(on(N.x),on(N.y),on(N.z).map($=>-$))),le.scale.set(U.width/100,U.thickness/100,ti(kt(U.b,U.a))/100)}else if(["wheel","roller","weight"].includes(U.kind)){let le=k.children[0];le.position.fromArray(Nt(D)),le.quaternion.setFromUnitVectors(new F(0,1,0),Si(on(Zt(B))));let N=(U.radius||6)/100;le.scale.set(N,U.kind==="roller"?.36:.055,N)}else if(["barbell","dumbbell"].includes(U.kind)){let le=U.kind==="barbell",N=le?61:12,$=le?48:9,ee=le?U.radius||17:6,ge=k.children[0];Xr(ge,bt(D,B,-N),bt(D,B,N),le?2.8:2.4);for(let ae of k.children.slice(1)){if(ae.name==="sleeve"){Xr(ae,bt(D,B,34*ae.userData.sign),bt(D,B,61*ae.userData.sign),5);continue}let ie=ae.name==="collar",Ae=$+(ie?3:0);ae.position.fromArray(Nt(bt(D,B,Ae*ae.userData.sign))),ae.quaternion.setFromUnitVectors(new F(0,1,0),Si(on(Zt(B)))),ae.scale.set((ie?3.5:ee)/100,ie?.018:le?.05:.035,(ie?3.5:ee)/100)}}else if(U.kind==="kettlebell"){ol(k.children[0],D,[U.radius||8.5,U.radius||8.5,U.radius||8.5]);let le=k.children[1],N=Zt(kt(D,U.grip)),$=[1,0,0],ee=Zt(ni($,N));le.position.fromArray(Nt(bt(U.grip,N,3))),le.quaternion.copy(al(on($),on(N).map(ge=>-ge),on(ee)))}}function ve(M,U={},k={}){Me=M,Ee={...Ee,...U};let D=M.pose,B=!!k.shape,le=!!(x&&Ee.skeleton&&M.body),N=!!(x&&Ee.anatomy&&M.body),$=le||N,ee=x&&!$&&Ee.anny!==!1&&M.pose?.frames?globalThis.AnnySkin?.data:null;R=!!ee,x&&(x.group.visible=!ee,ee?x.dots(M,Ee):x.apply(M,Ee,B)),ee?v.update(ee,M,{on:Ee.muscles!==!1,color:Ee.color,values:M.values,sideValues:M.sideValues,regions:M.regions,selected:Ee.selected}):v?.hide();let ge=N?M.boneFrames||globalThis.Skeleton.frames(D,M.body,Ee.anatomy.skeleton.bones):null;le?L.update(Ee.skeleton,D,M.body,ge&&Ee.anatomy.skeleton===Ee.skeleton?ge:M.boneFrames||void 0):L.hide(),N?z.update(Ee.anatomy,ge,Ee.color,{values:M.values,sideValues:M.sideValues,regions:M.regions,phases:Ee.muscles!==!1,selected:Ee.selected},M.poseKey&&typeof M.phase=="number"?{t:M.phase,key:M.poseKey}:null):z.hide(),x&&($||Y)&&j($);let ae=ee?[]:M.surfaces;if($||!ae.length)for(let Re of G.values())Re.visible=!1;if(!x){eh(C.geometry,M.torsoRings.length-1,s,(Oe,lt)=>{let Et=Math.min(M.torsoRings.length-2,Math.floor(Oe*(M.torsoRings.length-1))),vt=Oe*(M.torsoRings.length-1)-Et,wt=M.torsoRings[Et],Jt=M.torsoRings[Et+1],xn=wt[0]+(Jt[0]-wt[0])*vt,dt=wt[1]+(Jt[1]-wt[1])*vt,Wt=wt[2]+(Jt[2]-wt[2])*vt,$t=wt[3]+(Jt[3]-wt[3])*vt,An=lt*Math.PI*2,Nn=Math.cos(An);return bt(bt(Tx(D,xn),D.x,dt*Math.sin(An)),D.chestN||D.n,(Nn>=0?Wt:$t)*Nn)}),ol(A,D.head,[8.8,12.3,10]);let Re=on(D.headU),fe=on(D.headN),me=Zt(ni(Re,fe));A.quaternion.copy(al(me,Re,fe)),ol(w,bt(D.head,D.headN,9.5),[1.7,2,3]),Xr(P,bt(D.sh,D.chestU||D.u,-2),D.head,8.5);for(let Oe of["L","R"]){for(let dt of["ua","fa","th","sh"]){let Wt=g[dt+Oe],$t=D[Wt.a],An=D[Wt.b],Nn=jc($t,An,dt==="th"||dt==="sh"?ni(D.x,kt(An,$t)):D.n),$i=M.limbProfiles[dt];eh(Wt.mesh.geometry,t,n,(Jr,_l)=>{let[xl,yl]=Ld($i,Jr),$r=_l*Math.PI*2;return bt(bt(bt($t,kt(An,$t),Jr),Nn.x,xl*Math.cos($r)),Nn.y,yl*Math.sin($r))})}for(let dt of["sh","el","wr","kn"]){let Wt=g[dt+"-joint"+Oe];ol(Wt.mesh,D[dt+Oe],[Wt.r,Wt.r,Wt.r])}Cx(g["hand"+Oe].mesh,D,Oe,M.props);let lt=D["heel"+Oe],Et=D["toe"+Oe],vt=g["shoe"+Oe].mesh;Xr(vt,lt,Et,8),vt.scale.x=.095,vt.scale.z=.055;let wt=D["hip"+Oe],Jt=D["kn"+Oe],xn=jc(wt,Jt,ni(D.x,kt(Jt,wt)));eh(g["shorts"+Oe].mesh.geometry,2,16,(dt,Wt)=>{let $t=dt*.145,[An,Nn]=Ld(M.limbProfiles.th,$t),$i=Wt*Math.PI*2;return bt(bt(bt(wt,kt(Jt,wt),$t),xn.x,(An+.2)*Math.cos($i)),xn.y,(Nn+.2)*Math.sin($i))});for(let dt of["sh","el","wr","hip","kn","an"])g["dot"+dt+Oe].mesh.position.fromArray(Nt(D[dt+Oe]))}S.visible=!!Ee.joints}let ie=new Map;for(let Re of ae){let fe=Re.id+":"+Re.side;ie.has(fe)||ie.set(fe,[]),ie.get(fe).push(Re)}for(let[Re,fe]of ie){let me=G.get(Re);if(!me){let xn=new st;xn.setAttribute("position",new qe(new Float32Array(fe.length*6*3),3));let dt=Ct("#a7b3c6",{roughness:.82});dt.polygonOffset=!0,dt.polygonOffsetFactor=-1,dt.polygonOffsetUnits=-1,me=ft(de,xn,dt,Re),me.receiveShadow=!1,me.userData={region:fe[0].id,side:fe[0].side},G.set(Re,me)}me.geometry.attributes.position.count!==fe.length*6&&(me.geometry.dispose(),me.geometry=new st,me.geometry.setAttribute("position",new qe(new Float32Array(fe.length*6*3),3)));let Oe=0,lt=me.geometry.attributes.position;for(let xn of fe)for(let dt of[0,1,2,0,2,3])lt.setXYZ(Oe++,...Nt(xn.points[dt]));lt.needsUpdate=!0,B||(me.geometry.computeVertexNormals(),me.geometry.computeBoundingSphere()),me.geometry.computeBoundingBox();let Et=fe[0].id,vt=fe[0].side,wt=Ee.muscles!==!1&&!$,Jt=wt&&(!Ee.selected||Ee.selected==="all"||Ee.selected===Et||Ee.selected===fe[0].parent);me.visible=wt,me.material.color.set(Jt?Ee.color(M.sideValues?.[vt]?.[Et]??M.values[Et]??.28):"#a0adc0"),Jt?me.material.emissive.copy(me.material.color).multiplyScalar(Ut.muscleGlow):me.material.emissive.setRGB(0,0,0)}if(ye.length!==M.props.length||ye.some((Re,fe)=>Re.key!==(Wr(M.props[fe])?Kc(M.props[fe]):M.props[fe].kind)||Re.group.parent!==(ks(M.props[fe])?Ze:pe))){for(let Re of[pe,Ze,Ge])Re.traverse(fe=>fe.geometry?.dispose()),Re.clear();ye=M.props.map(te),ne=null}let Ae=!!ne&&M.props.every((Re,fe)=>!ks(Re)||th(ne[fe],Re));M.props.forEach((Re,fe)=>{(!Ae||!ks(Re))&&se(ye[fe],Re)}),oe(Ee.stress?M.stress||[]:[]),r.updateMatrixWorld(!0),Ae||re(M.props)}let he=Object.fromEntries(Object.entries(qr).map(([M,[U,k]])=>{let D=U*Math.PI/180,B=k*Math.PI/180,le=[-Math.sin(D)*Math.cos(B),-Math.sin(B),Math.cos(D)*Math.cos(B)],N=new Kn(-1,1,1,-1,.01,30);return N.position.fromArray(le.map($=>$*8)),N.lookAt(0,0,0),N.updateMatrixWorld(!0),[M,N]})),Se=Object.fromEntries(Object.keys(he).map(M=>[M,{minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0}])),We=(M,U)=>{for(let k=M;k;k=k.parent)if(k===U)return!0;return!1},ze=M=>!!x&&(R?We(M,x.group):We(M,v.group));function I(M,U){let k=M==="body"&&x?R?v.group:x.group:r,D=B=>{U?.(B.x,B.y,B.z);for(let[le,N]of Object.entries(he)){let $=B.clone().applyMatrix4(N.matrixWorldInverse),ee=Se[le];ee.minX=Math.min(ee.minX,$.x),ee.maxX=Math.max(ee.maxX,$.x),ee.minY=Math.min(ee.minY,$.y),ee.maxY=Math.max(ee.maxY,$.y)}};k.traverse(B=>{if(!B.isMesh||!B.visible||B===d||B.name==="dot-ring"||B.parent===S||B.parent?.name==="joint-dots"||B.parent?.parent===Te||B.userData.merged||B.userData.ghostTwin||ze(B))return;if(B.userData.boundsPoints){for(let N of B.userData.boundsPoints)D(N);return}B.geometry.boundingBox||B.geometry.computeBoundingBox();let le=B.geometry.boundingBox;for(let N of[le.min.x,le.max.x])for(let $ of[le.min.y,le.max.y])for(let ee of[le.min.z,le.max.z])D(Si([N,$,ee]).applyMatrix4(B.matrixWorld))})}function b(M,U,k=1.13){for(let[D,B]of Object.entries(he)){let le=Se[D],N=(le.minX+le.maxX)/2,$=(le.minY+le.maxY)/2,ee=(le.maxX-le.minX)*k,ge=(le.maxY-le.minY)*k,ae=M/U;ee/ge<ae?ee=ge*ae:ge=ee/ae,B.left=N-ee/2,B.right=N+ee/2,B.top=$+ge/2,B.bottom=$-ge/2,B.updateProjectionMatrix()}}let X=[],J=null;function ue(M){if(!M?.isWebGLRenderer)return!1;if(Q=M,M.toneMapping=ha,M.toneMappingExposure=Ut.exposure,M.outputColorSpace=It,M.shadowMap.enabled=!!Ut.shadow,M.shadowMap.type=Ut.shadow==="soft"?ta:Dr,Ut.environment)try{let U=new Ps(M),k=new el,D=U.fromScene(k,.04);X.push(D),k.dispose?.(),U.dispose(),J=D.texture;for(let B of Object.values(h))B.metalness>=.3&&(B.envMap=J,B.envMapIntensity=Ut.environment,B.needsUpdate=!0)}catch{J=null}if(typeof document<"u"){let U=document.createElement("canvas");U.width=U.height=256;let k=U.getContext("2d");if(k){let D=k.createRadialGradient(128,112,10,128,128,190);D.addColorStop(0,Ut.background[0]),D.addColorStop(1,Ut.background[1]),k.fillStyle=D,k.fillRect(0,0,256,256);let B=new pr(U);B.colorSpace=It,r.background=B,X.push(B)}}if(p.castShadow=!!Ut.shadow,p.shadow.mapSize.set(1024,1024),p.shadow.bias=-4e-4,p.shadow.normalBias=.02,p.shadow.radius=4,!x)for(let U of Object.values(g))U?.mesh?.traverse?.(k=>{k.isMesh&&(k.receiveShadow=!1)});return r.getObjectByName("joint-dots")?.traverse(U=>{U.castShadow=!1,U.receiveShadow=!1}),xe(),!0}let Q=null;function Ue(M){Q&&(M=!!M&&!!Ut.shadow,Q.shadowMap.enabled!==M&&(Q.shadowMap.enabled=M,p.castShadow=M,r.traverse(U=>{if(U.material)for(let k of[].concat(U.material))k.needsUpdate=!0})))}function xe(){let M=new tn;r.traverse(B=>{if(!(!B.isMesh||!B.visible||B===d||B.name==="dot-ring"||B.parent===S||B.parent?.name==="joint-dots"||B.parent?.parent===Te||B.userData.merged||ze(B))){if(B.userData.boundsPoints){for(let le of B.userData.boundsPoints)M.expandByPoint(le);return}M.expandByObject(B)}}),M.isEmpty()&&M.set(new F(-1,0,-1),new F(1,2,2)),M.expandByScalar(.7);let U=M.getCenter(new F),k=M.getSize(new F).length()/2;for(let B of[p,_,y])B.target.position.copy(U),B.position.copy(U).add(B.userData.dir||(B.userData.dir=B.position.clone().normalize().multiplyScalar(8))),B.target.updateMatrixWorld();let D=p.shadow.camera;D.left=-k,D.right=k,D.top=k,D.bottom=-k,D.near=.1,D.far=8+k*2,D.updateProjectionMatrix(),p.shadow.needsUpdate=!0}return ve(i,{color:()=>"#a7b3c6"}),{scene:r,cameras:he,apply:ve,includeBounds:I,resize:b,bounds:Se,regionMeshes:G,parts:g,body:C,head:A,mannequin:x,skeleton:L,muscleLayer:z,propNodes:()=>ye,staticMeshes:()=>Ge.children,studio:ue,fitShadow:xe,setShadows:Ue,anny:v,dispose(){Ie(),Le()},disposeGeometry:Ie,disposeMaterials:Le};function Ie(){r.traverse(M=>{if(M.geometry?.dispose(),M.isLight&&M.shadow?.map&&M.shadow.dispose(),M.material)for(let U of[].concat(M.material))U.map?.dispose()});for(let M of X)M.dispose();X=[],L.disposeTexture()}function Le(){let M=new Set([H,V]);r.traverse(U=>{if(U.material)for(let k of[].concat(U.material))M.add(k);U.customDepthMaterial&&M.add(U.customDepthMaterial)});for(let U of M)U.dispose()}}var nh=[.6,.8,1,1.25,1.6,2,2.6,3.4],ih=400,Dd=160,Ud=15,Nd=10,sh=1.25,bi=Math.PI/180,Ix=12,Px=.3,zs=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2],rh=(i,e,t)=>Math.min(t,Math.max(e,i)),Yr=i=>(i=(i+Math.PI)%(2*Math.PI),i<0&&(i+=2*Math.PI),i-Math.PI),Zr=(i={})=>({fov:i.fov??28,pad:i.pad??1.13,settings:i.settings});function ul(i,e){let t=Math.cos(i),n=Math.sin(i),s=Math.cos(e),r=Math.sin(e);return{right:[t,0,n],up:[n*r,s,-t*r],back:[-n*s,r,t*s]}}function dl(i,e){let t=i[e];return{yaw:Yr(t[0]*bi),pitch:-t[1]*bi}}var oh=i=>[(i[0]+i[3])/2,(i[1]+i[4])/2,(i[2]+i[5])/2],Fd=i=>[(i[3]-i[0])/2,(i[4]-i[1])/2,(i[5]-i[2])/2],Od=i=>Math.hypot(...Fd(i));function Bd(i,e={}){let{fov:t,pad:n}=Zr(e),s=t>0?Math.tan(t*bi/2)/n:0,r=s?nh.map(f=>f*s):[],o=r.length,a=Object.keys(i).map(f=>{let p=dl(i,f),_=ul(p.yaw,p.pitch);return{id:f,R:_.right,U:_.up,B:_.back,r:[1/0,-1/0,1/0,-1/0],x:new Array(2*o).fill(-1/0),y:s?[-1/0,-1/0]:[]}}),l=[1/0,1/0,1/0,-1/0,-1/0,-1/0],c=0;function h(f,p,_){if(!(!Number.isFinite(f)||!Number.isFinite(p)||!Number.isFinite(_))){c++,f<l[0]&&(l[0]=f),p<l[1]&&(l[1]=p),_<l[2]&&(l[2]=_),f>l[3]&&(l[3]=f),p>l[4]&&(l[4]=p),_>l[5]&&(l[5]=_);for(let y of a){let m=y.R[0]*f+y.R[2]*_,d=y.U[0]*f+y.U[1]*p+y.U[2]*_,E=y.B[0]*f+y.B[1]*p+y.B[2]*_,x=y.r;m<x[0]&&(x[0]=m),m>x[1]&&(x[1]=m),d<x[2]&&(x[2]=d),d>x[3]&&(x[3]=d);for(let g=0;g<o;g++){let C=r[g],A=m+C*E,w=C*E-m;A>y.x[g]&&(y.x[g]=A),w>y.x[o+g]&&(y.x[o+g]=w)}if(s){let g=d+s*E,C=s*E-d;g>y.y[0]&&(y.y[0]=g),C>y.y[1]&&(y.y[1]=C)}}}}function u(){if(!c)return null;let f=_=>Math.ceil(_*1e4)/1e4,p=_=>Math.floor(_*1e4)/1e4;return{fov:t,pad:n,box:[...l.slice(0,3).map(p),...l.slice(3).map(f)],cams:Object.fromEntries(a.map(_=>[_.id,{r:[p(_.r[0]),f(_.r[1]),p(_.r[2]),f(_.r[3])],x:_.x.map(f),y:_.y.map(f)}]))}}return{add:h,data:u,get count(){return c}}}function kd(i,e={}){let{fov:t,pad:n,settings:s}=Zr(e),r=t>0?nh.length:0,o=a=>Array.isArray(a)&&a.every(Number.isFinite);return!i||typeof i!="object"||i.fov!==t||i.pad!==n||!o(i.box)||i.box.length!==6||!i.cams?!1:Object.keys(s).every(a=>{let l=i.cams[a];return l&&o(l.r)&&l.r.length===4&&o(l.x)&&l.x.length===2*r&&o(l.y)&&l.y.length===(r?2:0)})}function Lx(i,e,t){let n=nh.map(c=>c*t),s=n.length,r=c=>i.x[c],o=c=>i.x[s+c];if(e>=n[s-1])return[r(s-1),o(s-1),n[s-1]];if(e<=n[0]){let c=e/n[0];return[i.r[1]+(r(0)-i.r[1])*c,-i.r[0]+(o(0)+i.r[0])*c,e]}let a=0;for(;e>n[a+1];)a++;let l=(e-n[a])/(n[a+1]-n[a]);return[r(a)+(r(a+1)-r(a))*l,o(a)+(o(a+1)-o(a))*l,e]}function zd(i,e,t,n={}){let{fov:s,pad:r,settings:o}=Zr(n),{yaw:a,pitch:l}=dl(o,e),c=ul(a,l),h=i.cams[e],u=oh(i.box);t=t>0?t:1;let f,p,_,y;if(s>0){let E=Math.tan(s*bi/2),x=E/r,[g,C,A]=Lx(h,x*t,x),w=Math.max((g+C)/(2*A),(h.y[0]+h.y[1])/(2*x));f=(g-C)/2,p=(h.y[0]-h.y[1])/2,_=Math.max(Px,w-zs(c.back,u)),y=_*E}else{let E=h.r;f=(E[0]+E[1])/2,p=(E[2]+E[3])/2;let x=Math.max(.001,(E[1]-E[0])*r),g=Math.max(.001,(E[3]-E[2])*r);x/g<t?x=g*t:g=x/t,y=g/2,_=Ix+Od(i.box)}let m=f-zs(c.right,u),d=p-zs(c.up,u);return{yaw:a,pitch:l,d:_,s:y,ox:m,oy:d,zoom:1,px:m,py:d}}function ah(i,e,t,n={}){let{fov:s}=Zr(n),r=ul(e.yaw,e.pitch),o=oh(i.box),a=Od(i.box),l=[0,1,2].map(h=>o[h]+e.d*r.back[h]+e.ox*r.right[h]+e.oy*r.up[h]),c={...r,position:l,zoom:e.zoom,far:e.d+a+20};return s>0?{...c,fov:s,near:Math.max(.05,(e.d-a)*.5)}:{...c,half:[e.s*t,e.s],near:.01}}function Hd(i,e,t,n,s={}){let r=ah(i,e,t,s),o=[n[0]-r.position[0],n[1]-r.position[1],n[2]-r.position[2]],a=zs(r.right,o),l=zs(r.up,o),c=-zs(r.back,o);if(r.fov){let h=Math.tan(r.fov*bi/2)/e.zoom;return[a/(c*h*t),l/(c*h),c]}return[a*e.zoom/r.half[0],l*e.zoom/r.half[1],c]}function Vd(i,e,t,n={}){let{fov:s,pad:r}=Zr(n),o=oh(i.box),a=Fd(i.box),l=Math.max(.001,Math.hypot(...a)),c=ul(e.yaw,e.pitch),h=Math.min(1,t>0?t:1),u=Math.abs(c.right[0])*a[0]+Math.abs(c.right[2])*a[2],f=Math.abs(c.up[0])*a[0]+Math.abs(c.up[1])*a[1]+Math.abs(c.up[2])*a[2],p,_=0;if(s>0){let y=Math.tan(s*bi/2);p=e.d>l*1.01?y*h*Math.sqrt(e.d*e.d-l*l)/(r*l):.3,_=Math.asin(rh((.25-o[1]-e.oy)/e.d,-1,1))}else p=e.s*h/(r*l);return{zMin:Math.min(1,Math.max(.3,p)),zMax:4,ex:u,ey:f,pitchMin:Math.max(-8*bi,_),pitchMax:85*bi}}var Gd=i=>Math.max(.3,1-.7/i);function hl(i,e,t,n=1){let s=Math.max(t,Math.abs(i)*n);return Math.abs(e)<=s?e:Math.sign(e)*s}function fl(i,e,t,n){let s=Math.min(n.pitchMin,i.pitch),r=Math.max(n.pitchMax,i.pitch);return{...i,yaw:Yr(i.yaw+e),pitch:rh(i.pitch+t,s,r)}}function Wd(i,e,t,n,s){let r=Gd(i.zoom),o=i.s*n/i.zoom,a=i.s/i.zoom;return{...i,ox:hl(i.ox,i.ox-e*o,Math.max(s.ex*r,Math.abs(i.px))),oy:hl(i.oy,i.oy-t*a,Math.max(s.ey*r,Math.abs(i.py)))}}function lh(i,e,t,n,s,r){let o=rh(i.zoom*e,Math.min(r.zMin,i.zoom),Math.max(r.zMax,i.zoom));if(Math.abs(o-i.zoom)<1e-9)return i;let a=1/i.zoom-1/o,l=Gd(o),c=Math.min(1,o/i.zoom);return{...i,zoom:o,ox:hl(i.ox,i.ox+t*i.s*s*a,Math.max(r.ex*l,Math.abs(i.px)),c),oy:hl(i.oy,i.oy+n*i.s*a,Math.max(r.ey*l,Math.abs(i.py)),c)}}var Dx=i=>i<.5?4*i*i*i:1-Math.pow(2-2*i,3)/2;function Xd(i,e,t){if(t>=1)return e;if(t<=0)return i;let n=Dx(t),s=(r,o)=>r+(o-r)*n;return{yaw:Yr(i.yaw+Yr(e.yaw-i.yaw)*n),pitch:s(i.pitch,e.pitch),d:s(i.d,e.d),s:s(i.s,e.s),ox:s(i.ox,e.ox),oy:s(i.oy,e.oy),zoom:Math.exp(s(Math.log(i.zoom),Math.log(e.zoom))),px:e.px,py:e.py}}var ch=(i,e,t=1e-4)=>Math.abs(Yr(i.yaw-e.yaw))<t&&Math.abs(i.pitch-e.pitch)<t,hh=(i,e,t=1e-6)=>ch(i,e,t)&&["d","s","ox","oy","zoom"].every(n=>Math.abs(i[n]-e[n])<t),uh=(i,e)=>i*Math.PI/Math.max(320,e||0);var Ux={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down","+":"in","=":"in","-":"out",_:"out",0:"reset"};function qd(i,e){let t=new Map,n=null,s=null,r=null,o=null,a="",l=()=>i.getBoundingClientRect(),c=()=>{let[x,g]=[...t.values()];return{x:(x.x+g.x)/2,y:(x.y+g.y)/2,dist:Math.hypot(x.x-g.x,x.y-g.y)}};function h(x){if(a=x.pointerType,x.pointerType==="mouse"){if(x.button!==0&&x.button!==2)return;s={id:x.pointerId,x:x.clientX,y:x.clientY,pan:x.button===2};try{i.setPointerCapture(x.pointerId)}catch{}i.dataset.drag="",e.start();return}t.set(x.pointerId,{x:x.clientX,y:x.clientY,x0:x.clientX,y0:x.clientY,t0:x.timeStamp}),t.size===1?n="wait":t.size===2&&n!=="done"&&(n="pinch",r=c(),e.start())}function u(x){if(x.pointerType==="mouse"){if(!s||x.pointerId!==s.id)return;let w=x.clientX-s.x,P=x.clientY-s.y;s.x=x.clientX,s.y=x.clientY,(w||P)&&(s.pan||x.shiftKey?e.pan(w,P):e.rotate(w,P));return}let g=t.get(x.pointerId);if(!g)return;let C=g.x,A=g.y;if(g.x=x.clientX,g.y=x.clientY,n==="wait"){let w=g.x-g.x0,P=g.y-g.y0;if(Math.hypot(w,P)<8)return;Math.abs(w)>Math.abs(P)?(n="rotate",e.start(),e.rotate(w,P)):n="scroll";return}if(n==="rotate"&&t.size===1)e.rotate(g.x-C,g.y-A);else if(n==="pinch"&&t.size===2){let w=c(),P=l();w.dist>0&&r.dist>0&&e.zoom(w.dist/r.dist,w.x-P.left,w.y-P.top),e.pan(w.x-r.x,w.y-r.y),r=w}}function f(x){if(x.pointerType==="mouse"){s&&x.pointerId===s.id&&(s=null,delete i.dataset.drag);return}let g=t.get(x.pointerId);g&&(t.delete(x.pointerId),x.type==="pointerup"&&n==="wait"&&!t.size&&x.timeStamp-g.t0<350&&(o&&x.timeStamp-o.t<400&&Math.hypot(g.x-o.x,g.y-o.y)<30?(o=null,e.start(),e.reset()):o={t:x.timeStamp,x:g.x,y:g.y}),t.size?(n==="pinch"||n==="rotate")&&(n="done"):(n=null,r=null))}let p=x=>{x.cancelable&&(x.touches.length>=2||n==="rotate"||n==="pinch"||n==="done")&&x.preventDefault()};function _(x){let g=x.deltaY*(x.deltaMode===1?16:x.deltaMode===2?400:1),C=l();(g!==0&&e.zoom(Math.exp(-g*(x.ctrlKey?.01:.0015)),x.clientX-C.left,x.clientY-C.top)||x.ctrlKey)&&x.preventDefault()}let y=x=>{a==="mouse"&&(x.preventDefault(),e.start(),e.reset())},m=x=>x.preventDefault();function d(x){if(x.altKey||x.ctrlKey||x.metaKey)return;let g=Ux[x.key];g&&(x.preventDefault(),e.key(g))}let E=[["pointerdown",h],["pointermove",u],["pointerup",f],["pointercancel",f],["lostpointercapture",f],["dblclick",y],["contextmenu",m],["keydown",d]];for(let[x,g]of E)i.addEventListener(x,g);return i.addEventListener("touchmove",p,{passive:!1}),i.addEventListener("wheel",_,{passive:!1}),()=>{for(let[x,g]of E)i.removeEventListener(x,g);i.removeEventListener("touchmove",p,{passive:!1}),i.removeEventListener("wheel",_,{passive:!1}),t.clear(),s=null}}var _n=!1,Hs=!1,Fx=40,Ox=48,Bx=3,Vs=[],pl={antialias:!0,alpha:!1,powerPreference:"low-power"};function gl(i){try{i.release?.()}catch{}i.renderer.dispose?.(),i.renderer.forceContextLoss?.()}function Qd(){for(;Vs.length;){let n=Vs.pop();if(!n.renderer.getContext?.()?.isContextLost?.())return n;gl(n)}let i=document.createElement("canvas"),e=null,t=null;try{t=i.getContext("webgl2",pl),t&&(e=new Hr({canvas:i,context:t,...pl}),e.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)))}catch{e=null}return e?{renderer:e,canvas:i,release:null}:(t?.getExtension("WEBGL_lose_context")?.loseContext(),null)}function ef(i){Vs.length>=Bx?gl(i):Vs.push(i)}var ml=12,ii=new Map,tf="podhod.volume-bounds.v1",kx=256,Yd=!1,Zd=0,mh=()=>window.PODHOD_BUILD||null;function nf(i){let e=2166136261,t=16777619;for(let n=0;n<i.length;n++){let s=i.charCodeAt(n);e=Math.imul(e^s,16777619),t=Math.imul(t^s,1540483477)^t>>>15}return(e>>>0).toString(36)+(t>>>0).toString(36)}var zx=i=>i&&typeof i=="object"&&Object.entries(i).every(([e,t])=>e==="_view"||t&&["minX","maxX","minY","maxY"].every(n=>Number.isFinite(t[n])));function sf(i){if(!Yd){Yd=!0;try{let e=JSON.parse(localStorage.getItem(tf)||"null");if(e&&e.build&&e.build===mh())for(let[t,n]of Object.entries(e.bounds||{}))!ii.has(t)&&zx(n)&&ii.set(t,n)}catch{}}return ii.get(i)||null}function rf(i,e){for(ii.delete(i),ii.set(i,e);ii.size>kx;)ii.delete(ii.keys().next().value);mh()&&(clearTimeout(Zd),Zd=setTimeout(()=>{try{localStorage.setItem(tf,JSON.stringify({build:mh(),bounds:Object.fromEntries(ii)}))}catch{}},1500))}var Ei=i=>Math.round(i*1e4)/1e4,dh=()=>typeof performance<"u"?performance.now():Date.now(),Hx=()=>typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches,Jd=null,Vx=()=>Jd||(Jd={fov:28,pad:1.13,settings:qr}),Gx=240,of=0;function af(i,e,t,n){if(!e||!n.body||!globalThis.Skeleton?.frames)return;i.data!==e&&(i.map.clear(),i.data=e);let s=i.map.get(t);s||(of++,s=globalThis.Skeleton.frames(n.pose,n.body,e.bones),i.map.size>=Gx&&i.map.delete(i.map.keys().next().value),i.map.set(t,s)),n.boneFrames=s}function $d(i,e){if(i===e)return!0;if(!i||!e||i.skeleton!==e.skeleton||i.muscles!==e.muscles)return!1;let t=i.level||{},n=e.level||{},s=Object.keys(t);return s.length!==Object.keys(n).length?!1:s.every(r=>t[r]===n[r])}function Wx(i){if(i.share?.linkView){let M=i.share.linkView(i);if(M)return M}if(_n)return null;if(typeof window.WebGL2RenderingContext>"u")return _n=!0,null;let e=document.createElement("div");e.className="fig volume-figure",e.setAttribute("role","img"),e.setAttribute("aria-label",i.label),e.dataset.camera=i.camera||"above";let t=Qd();if(!t)return _n=!0,null;e.dataset.renderer="webgl";let{renderer:n,canvas:s}=t,r=t.release,o=Vx();t.release=null;let a=(M,U,k=!1)=>i.data(M,U,!1,k),l=a(0,0),c=cl(l),h=c.cameras;e.append(n.domElement);let u=!1,f=i.t||0,p=0,_="all",y=i.muscles!==!1,m=!!i.joints,d=i.stress!==!1,E=null,x=null;if(!h[i.camera||"above"])throw Error("Unknown volume camera "+i.camera);let g=()=>{},C=i.memoBones?{map:new Map,data:null}:null,A=!1,w=!1,P=()=>{let M=globalThis.AnnySkin;A||!M||M.data||(A=!0,M.load().then(()=>{u||(!E&&!x?oe(f,{index:p}):v())},()=>{}))},S=M=>typeof requestIdleCallback=="function"?requestIdleCallback(M,{timeout:3e3}):setTimeout(M,200);function v(){let M=globalThis.AnnySkin;if(w||u||!M?.data||!(E||x)||!n.compileAsync||!c.anny)return;w=!0;let U=()=>!u&&(E||x)&&!n.getContext?.()?.isContextLost?.();S(()=>{if(U()){try{let k=a(f,p,!1);c.anny.update(M.data,k,{on:y,color:i.color,values:k.values,sideValues:k.sideValues,regions:k.regions,selected:_}),c.anny.hide()}catch{return}Promise.all([n.compileAsync(c.scene,h.angle),R(c.anny.mesh)]).then(()=>S(()=>{if(!U()||!n.setViewport)return;let k=c.anny.group,D=n.render.perfOrig||n.render;k.visible=!0;try{n.setViewport(0,0,1,1),n.setScissor(0,0,1,1),n.setScissorTest(!0),D.call(n,c.scene,h.angle)}catch{}finally{n.setScissorTest(!1),k.visible=!1,Ee||n.setViewport(0,0,te.w,te.h)}re()}),()=>{})}})}function R(M){let U=M?.customDepthMaterial;if(!U||!M.castShadow||!n.shadowMap?.enabled||!n.setRenderTarget||!n.compileAsync)return Promise.resolve();let k={[Qt]:Rt,[Rt]:Qt,[Bt]:Bt};U.side=M.material.shadowSide??k[M.material.side];let D=new Jn,B=new Ke(M.geometry,U);B.frustumCulled=!1,B.receiveShadow=M.receiveShadow,B.morphTargetInfluences=M.morphTargetInfluences,D.add(B);let le=new Sn(1,1),N=n.getRenderTarget(),$;try{n.setRenderTarget(le),$=n.compileAsync(D,h.angle,c.scene)}catch{$=Promise.resolve()}finally{n.setRenderTarget(N)}return $.catch(()=>{}).then(()=>le.dispose())}let L=()=>{!E&&!x&&P()},z=(M,U,k=!1)=>{let D=a(M,U,!!(E||x));C&&af(C,x?.skeleton||E,M,D),c.apply(D,{color:i.color,selected:_,muscles:y,joints:m,stress:d,skeleton:E,anatomy:x},{shape:k}),g(M,U,D.pose),L()},Y=new Ni(new st().setFromPoints(i.trace.map(M=>new F(...Nt(M)))),new $n({color:"#b4c3d9",transparent:!0,opacity:.7}));Y.visible=!1,c.scene.add(Y);let H=new it;H.name="movement-vectors",H.visible=!1,c.scene.add(H);for(let M of i.vectors){let U=new F(...Nt(M.a)),k=new F(...Nt(M.b)),D=k.clone().sub(U);H.add(new Lr(D.clone().normalize(),U,D.length(),/^(sh|hip)$/.test(M.key)?7842259:15298901,.075,.035))}g=(M,U,k)=>{i.vectors.forEach((D,B)=>{let le=i.vectorFrame?i.vectorFrame(D,M,U,k):D,N=H.children[B];if(N.visible=!!le,!le)return;let $=new F(...Nt(le.a)),ee=new F(...Nt(le.b)),ge=ee.sub($);N.position.copy($),N.setDirection(ge.clone().normalize()),N.setLength(ge.length(),.06,.03)}),H.updateMatrixWorld(!0)};let V=l.exerciseId+"|"+nf(JSON.stringify([l.props,i.vectors])),j=sf(V),G=null;if(j&&Object.keys(c.bounds).every(M=>j[M])&&kd(j._view,o)){for(let M of Object.keys(c.bounds))Object.assign(c.bounds[M],j[M]);G=j._view}else{let M=Bd(qr,o);for(let U=0;U<=ml;U++)z(U/ml,0,!0),c.includeBounds(void 0,M.add);G=M.data(),rf(V,{...Object.fromEntries(Object.entries(c.bounds).map(([U,k])=>[U,{minX:Ei(k.minX),maxX:Ei(k.maxX),minY:Ei(k.minY),maxY:Ei(k.maxY)}])),...G?{_view:G}:{}})}i.layers?(z(f,0,!0),c.studio?.(n),E=i.layers.bones||null,x=i.layers.body||null,e.dataset.skeleton=E?"on":"off",e.dataset.anatomy=x?"on":"off",P(),z(f,0)):(z(f,0),c.studio?.(n)),Hs&&c.setShadows?.(!1),globalThis.GymPerf?.volume({scene:c,renderer:n,options:i,root:e,low:()=>Hs});let de=[],pe=0;function ye(){let M=typeof performance<"u"?performance.now():Date.now(),U=M-pe;if(pe=M,Hs||!(U>0&&U<200)||(de.push(U),de.length<Fx))return;let k=de.sort((D,B)=>D-B)[de.length>>1];if(de.length=0,k>Ox){Hs=!0,c.setShadows?.(!1);for(let D of Me)D.root.dataset.quality="low"}}let Me=[],Ee=!1;function Ze(M,U,k){let D=k.interactive&&G?{cam:new Ft(28,1,.05,40),aspect:k.ratio||1.15,v:null,go:null,free:!1,user:!1,basis:new Qe,R:new F,U:new F,B:new F}:null,B={root:M,camera:U,o:k,orbit:D,canvas:null,ctx:null,w:0,h:0,stale:!0,pending:0,dirty:!1,drawnAt:-1,closed:!1,detach:null,observer:null},le=fe=>zd(G,fe,D.aspect,o);D&&(D.v=le(U),M.dataset.orbit="",M.dataset.free="0",M.tabIndex=0),B.viewNow=()=>{let fe=D.go;if(!fe)return D.v;let me=(dh()-fe.t0)/fe.ms;return me<1?Xd(fe.from,fe.to,me):(D.v=fe.to,D.go=null,D.v)};let N=()=>{D?.go&&(D.v=B.viewNow(),D.go=null)};B.place=()=>{let fe=B.viewNow(),me=ah(G,fe,D.aspect,o),Oe=D.cam;Oe.position.fromArray(me.position),Oe.quaternion.setFromRotationMatrix(D.basis.makeBasis(D.R.fromArray(me.right),D.U.fromArray(me.up),D.B.fromArray(me.back))),Oe.isPerspectiveCamera?(Oe.fov=me.fov,Oe.aspect=D.aspect):(Oe.left=-me.half[0],Oe.right=me.half[0],Oe.top=me.half[1],Oe.bottom=-me.half[1]),Oe.near=me.near,Oe.far=me.far,Oe.zoom=me.zoom,Oe.updateProjectionMatrix()},B.schedule=()=>{!u&&!B.closed&&!B.pending&&typeof requestAnimationFrame=="function"&&(B.pending=requestAnimationFrame($))};function $(fe){B.pending=0,!(u||B.closed)&&(B.dirty||D?.go&&B.drawnAt<fe?ne(B):D?.go&&B.schedule())}let ee=()=>{B.dirty=!0,B.schedule()};function ge(){let fe=D.go?D.go.to:D.v,me=!ch(fe,dl(qr,B.camera));if(me!==D.free){D.free=me,M.dataset.free=me?"1":"0";try{k.onCamera?.({camera:B.camera,free:me})}catch(Oe){console.error(Oe)}}}let ae=fe=>Vd(G,fe,D.aspect,o);function ie(fe){if(u||B.closed||!D)return!1;N();let me=D.v,Oe=fe(me);if(Oe===me||hh(Oe,me))return!1;D.v=Oe,D.user=!0,ge(),ee();try{k.onGesture?.()}catch{}return!0}function Ae(fe,me){N(),me>0&&!Hx()?D.go={from:D.v,to:fe,t0:dh(),ms:me}:D.v=fe,ge(),ee()}B.reset=()=>{!D||u||B.closed||(D.user=!1,Ae(le(B.camera),ih))},B.aspect=fe=>{if(D&&(D.aspect=fe,!D.user)){let me=le(B.camera);D.go?D.go.to=me:D.v=me}},B.setCamera=(fe,me={})=>u||B.closed||!h[fe]?!1:(B.camera=fe,M.dataset.camera=fe,D?(D.user=!1,Ae(le(fe),me.instant?0:ih),!0):(ne(B),!0));let Re=()=>{let fe=M.getBoundingClientRect();return[Math.max(1,fe.width),Math.max(1,fe.height)]};return B.detach=D?qd(M,{start:N,rotate:(fe,me)=>{let[Oe]=Re();return ie(lt=>fl(lt,uh(fe,Oe),uh(me,Oe)*.8,ae(lt)))},pan:(fe,me)=>{let[Oe,lt]=Re();return ie(Et=>Wd(Et,2*fe/Oe,-2*me/lt,D.aspect,ae(Et)))},zoom:(fe,me,Oe)=>{let[lt,Et]=Re();return ie(vt=>lh(vt,fe,2*me/lt-1,1-2*Oe/Et,D.aspect,ae(vt)))},reset:()=>{B.reset();try{k.onGesture?.()}catch{}},key(fe){if(fe==="reset"){B.reset();return}let me=D.go?D.go.to:D.v,Oe=ae(me),lt=Math.PI/180,Et=fe==="left"||fe==="right"?fl(me,(fe==="left"?-1:1)*Ud*lt,0,Oe):fe==="up"||fe==="down"?fl(me,0,(fe==="up"?1:-1)*Nd*lt,Oe):lh(me,fe==="in"?sh:1/sh,0,0,D.aspect,Oe);if(!hh(Et,me)){D.user=!0,Ae(Et,Dd);try{k.onGesture?.()}catch{}}}}):null,B.close=()=>{B.closed||(B.closed=!0,B.pending&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(B.pending),B.pending=0,B.detach?.(),B.observer?.disconnect())},B}let Ge=!1;function ne(M){if(u||M.closed)return;if(M.stale&&ve){if(!M.root.isConnected){M.dirty=!0;return}Je()}M.dirty=!1,M.drawnAt=dh();let U=M.orbit;U&&(M.place(),U.go&&M.schedule());let k=U?U.cam:h[M.camera];if(!Ee)n.render(c.scene,k);else{if(n.getContext?.()?.isContextLost?.())return;n.setViewport(0,0,M.w,M.h),n.setScissor(0,0,M.w,M.h),n.setScissorTest(!0);try{n.render(c.scene,k)}finally{n.setScissorTest(!1)}let D=M.canvas;M.ctx&&D.width&&D.height&&M.ctx.drawImage(s,0,s.height-D.height,D.width,D.height,0,0,D.width,D.height)}if(!Ge){Ge=!0;try{r?.()}catch{}}}function re(){let M=n.shadowMap,U=M?.autoUpdate,k=!0;try{for(let D of Me)D.closed||(!k&&M?.enabled&&(M.autoUpdate=!1,M.needsUpdate=!1),ne(D),k=!1)}finally{M&&(M.autoUpdate=U)}}function Te(M){let U=M.root.getBoundingClientRect(),k=Math.max(1,Math.min(1100,U.width||620)),D=Math.max(1,Math.round(U.height||k/(M.o.ratio||1.15))),B=M.stale;if(M.stale=!M.root.isConnected,M.w===k&&M.h===D)return B&&!M.stale;if(M.w=k,M.h=D,M.aspect(k/D),M.canvas){let le=n.getPixelRatio?.()||1,N=Math.floor(k*le),$=Math.floor(D*le);M.canvas.width!==N&&(M.canvas.width=N),M.canvas.height!==$&&(M.canvas.height=$)}return!0}let Ne=new be,Pe=!1;function Je(){let M=!Pe;Pe=!0;for(let k of Me)!k.closed&&Te(k)&&(M=!0);let U=Me[0];if(!Ee)(M||!n.getSize)&&n.setSize(U.w,U.h);else{let k=1,D=1;for(let B of Me)B.closed||(k=Math.max(k,B.w),D=Math.max(D,B.h));n.getSize?.(Ne),(Ne.x!==k||Ne.y!==D)&&(n.setSize(k,D,!1),M=!0)}return(M||!n.getSize)&&c.resize(U.w,U.h),M}function je(M){u||(Je()||M===!0||!n.getSize)&&re()}function O(){if(Ee)return;Ee=!0;let M=Me[0];M.canvas=document.createElement("canvas"),M.ctx=M.canvas.getContext?.("2d",{alpha:!1})||null,s.parentNode===e?e.replaceChild(M.canvas,s):e.append(M.canvas),M.w=M.h=0}let ce=()=>{for(let M of Me)M.closed||(M.root.dataset.pose=String(f),M.root.dataset.phase=String(p))};function oe(M,U){u||(f=M,p=U?.index||0,z(M,p),ce(),re(),ye())}let te=Ze(e,i.camera||"above",i);Me.push(te);let se=()=>{u||(z(f,p),je(!0))};s.addEventListener("webglcontextrestored",se);let ve=typeof ResizeObserver=="function";te.observer=ve?new ResizeObserver(je):null,te.observer?.observe(e),je();let he=()=>oe(f,{index:p}),Se=M=>{y!==!!M&&(y=!!M,he())},We=M=>{_!==M&&(_=M,he())},ze=M=>{m!==!!M&&(m=!!M,he())},I=M=>{d!==!!M&&(d=!!M,he())},b=()=>{for(let M of Me)M.root.dataset.skeleton=E?"on":"off",M.root.dataset.anatomy=x?"on":"off"},X=M=>{M=M||null,!(E===M&&te.root.dataset.skeleton)&&(E=M,b(),he())},J=M=>{M=M||null,!($d(x,M)&&te.root.dataset.anatomy)&&(x=M,b(),he())},ue=(M,U)=>{M=M||null,U=U||null,!(E===M&&$d(x,U)&&te.root.dataset.skeleton&&te.root.dataset.anatomy)&&(E=M,x=U,b(),he())},Q=M=>{Y.visible!==!!M&&(Y.visible=!!M,re())},Ue=M=>{H.visible!==!!M&&(H.visible=!!M,re())};oe(f,{index:p}),(E||x)&&v();function xe(){if(!u){u=!0;for(let M of Me)M.close();s.removeEventListener("webglcontextrestored",se),c.disposeGeometry(),t.release=Ge||!r?c.disposeMaterials:()=>{try{r()}catch{}c.disposeMaterials()},ef(t)}}function Ie(M,U){return{svg:M.root,at:U?(k,D)=>{u||M.closed||k===f&&(D?.index||0)===p||oe(k,D)}:oe,get camera(){return M.camera},setCamera:(k,D)=>M.setCamera(k,D),setMuscles:Se,setRegion:We,setJoints:ze,setStress:I,setSkeleton:X,setAnatomy:J,setLayers:ue,setTrace:Q,setVectors:Ue,get orbit(){return!!M.orbit},get free(){return!!M.orbit?.free},resetCamera:()=>M.reset(),cameraState:()=>M.orbit?{...M.viewNow(),aspect:M.orbit.aspect,free:M.orbit.free,moving:!!M.orbit.go,camera:M.camera}:null,projectWorld:k=>M.orbit?Hd(G,M.viewNow(),M.orbit.aspect,k,o):null,dispose:U?()=>{M.close();let k=Me.indexOf(M);k>0&&Me.splice(k,1)}:xe,...U?{linked:!0}:{linkView:Le}}}function Le(M){if(u||!G||!M.interactive||!h[M.camera||"above"])return null;let U=document.createElement("div");U.className="fig volume-figure",U.setAttribute("role","img"),U.setAttribute("aria-label",M.label),U.dataset.camera=M.camera||"above",U.dataset.renderer="webgl",O();let k=Ze(U,M.camera||"above",M);return k.canvas=document.createElement("canvas"),k.ctx=k.canvas.getContext?.("2d",{alpha:!1})||null,U.append(k.canvas),Me.push(k),ce(),te.root.dataset.skeleton&&b(),Hs&&(U.dataset.quality="low"),k.observer=ve?new ResizeObserver(je):null,k.observer?.observe(U),je(!0),Ie(k,!0)}return Ie(te,!1)}var Xx=3,qx=!1,Kd=1.1;function Yx(){let i=null,e=0,t=0,n=0,s=0,r=new Map,o=[],a={apply:0,render:0,copy:0},l=()=>typeof performance<"u"?performance.now():Date.now();function c(){for(let m of r.values())p(m,!0);r.clear();for(let m of o.splice(0))try{m()}catch{}i&&(i.canvas.removeEventListener("webglcontextrestored",h),gl(i),i=null),e=t=0}function h(){for(let m of r.values())p(m,!0);r.clear(),e=t=0}function u(){if(i)return i;if(_n)return null;if(typeof window.WebGL2RenderingContext>"u")return _n=!0,null;let m=document.createElement("canvas"),d=null,E=null;try{E=m.getContext("webgl2",pl),E&&(d=new Hr({canvas:m,context:E,...pl}),d.setPixelRatio(1))}catch{d=null}return d?(i={renderer:d,canvas:m,release:null},m.addEventListener("webglcontextrestored",h),i):(E?.getExtension?.("WEBGL_lose_context")?.loseContext(),_n=!0,null)}function f(m,d){let E=(S,v,R)=>d.data(S,v,!1,R),x=E(0,0,!0),g=cl(x),C=d.fit==="body"?"body":"all",A=!!d.still,w=x.exerciseId+"|"+nf(JSON.stringify([x.props,[]]))+"|"+C,P=A?null:sf(w);if(!A)if(P&&Object.keys(g.bounds).every(S=>P[S]))for(let S of Object.keys(g.bounds))Object.assign(g.bounds[S],P[S]);else{for(let S=0;S<=ml;S++)g.apply(E(S/ml,0,!0),{color:d.color}),g.includeBounds(C==="body"?"body":void 0);rf(w,Object.fromEntries(Object.entries(g.bounds).map(([S,v])=>[S,{minX:Ei(v.minX),maxX:Ei(v.maxX),minY:Ei(v.minY),maxY:Ei(v.maxY)}])))}return g.studio?.(i.renderer),qx||g.setShadows?.(!1),s++,globalThis.GymPerf?.volume({scene:g,renderer:i.renderer,options:d,root:null,card:!0}),{key:m,scene:g,data:E,color:d.color,applied:null,aspect:0,bones:{map:new Map,data:null},still:A,fit:C,framed:null}}function p(m,d){try{m.scene.disposeGeometry()}catch{}if(d)try{m.scene.disposeMaterials()}catch{}else o.push(m.scene.disposeMaterials)}function _(m,d){let E=r.get(m);if(E)return r.delete(m),r.set(m,E),E;E=f(m,d),r.set(m,E);for(let[x,g]of r){if(r.size<=Xx)break;g!==E&&(r.delete(x),p(g,!1))}return E}function y(m){let d=null,E=null,x=m.muscles!==!1,g=m.stress!==!1,C=!1,A=()=>(d?"b":"")+(E?"a"+Object.entries(E.level||{}).map(([w,P])=>w+P).join(","):"")+(x?"m":"")+(g?"s":"");return{key:m.key,setLayers(w,P){d=w||null,E=P||null},setLook(w){"muscles"in w&&(x=!!w.muscles),"stress"in w&&(g=!!w.stress)},paint(w,P,S,v="above"){if(C||!w?.width||!w?.height)return!1;let R=u();if(!R||R.renderer.getContext?.()?.isContextLost?.())return!1;let L=_(m.key,m),z=L.scene.cameras[v]||L.scene.cameras.above;(e!==w.width||t!==w.height)&&(e=w.width,t=w.height,R.renderer.setSize(e,t,!1)),!L.still&&L.aspect!==e/t&&(L.aspect=e/t,L.scene.resize(e,t,Kd));let Y=P+"|"+(S||0)+"|"+A(),H=l();if(L.applied!==Y){let ye=L.data(P,S||0,!!(d||E));af(L.bones,E?.skeleton||d,P,ye),L.scene.apply(ye,{color:L.color,selected:"all",muscles:x,joints:!1,stress:g,skeleton:d,anatomy:E}),L.applied=Y}let V=Y+"|"+e/t;if(L.still&&L.framed!==V){for(let ye of Object.values(L.scene.bounds))Object.assign(ye,{minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0});L.scene.includeBounds(L.fit==="body"?"body":void 0),L.scene.resize(e,t,Kd),L.framed=V,L.aspect=e/t}let j=l();R.renderer.render(L.scene.scene,z),n++;let G=l(),de=w.getContext("2d");if(!de)return!1;de.drawImage(R.canvas,0,0,e,t),a.apply=j-H,a.render=G-j,a.copy=l()-G;let pe=globalThis.GymPerf;pe&&!L.still&&pe.card?.(a.apply+a.render+a.copy,a.copy);for(let ye of o.splice(0))try{ye()}catch{}return!0},prepare(){if(C)return!1;let w=u();return!w||w.renderer.getContext?.()?.isContextLost?.()?!1:(_(m.key,m),!0)},forget(){C=!0;let w=r.get(m.key);w&&(r.delete(m.key),p(w,!1))},release(){C=!0}}}return{figure:y,dispose:c,stats:()=>({scenes:r.size,renders:n,builds:s,context:!!i,size:[e,t],timing:{...a}}),get builds(){return s},get available(){return!_n}}}var fh=null;function Zx(){return!_n&&typeof window.WebGL2RenderingContext>"u"&&(_n=!0),_n?null:(fh||(fh=Yx()),fh)}var jd=!1;function Jx(i){if(jd||_n||Vs.length)return Promise.resolve(!1);if(typeof window.WebGL2RenderingContext>"u")return _n=!0,Promise.resolve(!1);jd=!0;let e=Qd();if(!e)return _n=!0,Promise.resolve(!1);let{renderer:t}=e,n=i.layers||null,s;try{s=cl(i.data(0,0,!1,!1));let l={color:i.color,selected:"all",muscles:i.muscles!==!1,joints:!!i.joints,stress:i.stress!==!1},c=h=>{let u=i.data(i.t||0,0,!1,h);return u.poseKey=null,u};n&&globalThis.AnnySkin?.data&&s.apply(c(!1),{...l,skeleton:null,anatomy:null}),s.apply(c(!!n),{...l,skeleton:n?.bones||null,anatomy:n?.body||null}),s.studio?.(t),Hs&&s.setShadows?.(!1)}catch{return gl(e),Promise.resolve(!1)}let r=s.cameras.angle;s.resize(1,1),t.setSize(1,1,!1),e.release=s.dispose,ef(e);let o=l=>typeof requestIdleCallback=="function"?requestIdleCallback(l,{timeout:2e3}):setTimeout(l,50),a=()=>Vs.includes(e)&&!t.getContext?.()?.isContextLost?.();return new Promise(l=>o(()=>{if(!a()){l(!1);return}(t.compileAsync?t.compileAsync(s.scene,r):Promise.resolve()).then(()=>o(()=>{if(a())try{t.render(s.scene,r)}catch{}l(a())}),()=>l(!1))}))}window.GymVolume={create:Wx,cards:Zx,prewarm:Jx,get boneMisses(){return of+Sd().misses}};})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
