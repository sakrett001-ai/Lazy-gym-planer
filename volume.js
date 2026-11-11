(()=>{var Fh=0,Zl=1,Oh=2;var br=1,Xo=2,An=3,Vt=0,Mt=1,Pt=2,zn=0,Mi=1,Jl=2,$l=3,Kl=4,Bh=5,ei=100,zh=101,kh=102,Hh=103,Vh=104,Gh=200,Wh=201,Xh=202,qh=203,po=204,mo=205,Yh=206,Zh=207,Jh=208,$h=209,Kh=210,jh=211,Qh=212,eu=213,tu=214,qo=0,Yo=1,Zo=2,Si=3,Jo=4,$o=5,Ko=6,jo=7,Qo=0,nu=1,iu=2,kn=0,su=1,ru=2,ou=3,au=4,lu=5,cu=6,ea=7;var jl=300,Ri=301,Ci=302,ta=303,na=304,Er=306,go=1e3,Qn=1001,_o=1002,Ut=1003,hu=1004;var wr=1005;var Gt=1006,ia=1007;var ai=1008;var Sn=1009,Ql=1010,ec=1011,hs=1012,sa=1013,li=1014,sn=1015,us=1016,ra=1017,oa=1018,ds=1020,tc=35902,nc=35899,ic=1021,sc=1022,Xt=1023,ts=1026,fs=1027,aa=1028,la=1029,rc=1030,ca=1031;var ha=1033,Tr=33776,Ar=33777,Rr=33778,Cr=33779,ua=35840,da=35841,fa=35842,pa=35843,ma=36196,ga=37492,_a=37496,xa=37808,ya=37809,va=37810,Ma=37811,Sa=37812,ba=37813,Ea=37814,wa=37815,Ta=37816,Aa=37817,Ra=37818,Ca=37819,Ia=37820,Pa=37821,Da=36492,La=36494,Ua=36495,Na=36283,Fa=36284,Oa=36285,Ba=36286;var Xs=2300,xo=2301,fo=2302,Ol=2400,Bl=2401,zl=2402;var uu=3200,ps=3201;var za=0,du=1,Hn="",St="srgb",bi="srgb-linear",qs="linear",lt="srgb";var yi=7680;var kl=519,fu=512,pu=513,mu=514,oc=515,gu=516,_u=517,xu=518,yu=519,Hl=35044,ms=35048;var ac="300 es",xn=2e3,Ys=2001;var Nn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Dt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var al=Math.PI/180,yo=180/Math.PI;function gs(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Dt[i&255]+Dt[i>>8&255]+Dt[i>>16&255]+Dt[i>>24&255]+"-"+Dt[e&255]+Dt[e>>8&255]+"-"+Dt[e>>16&15|64]+Dt[e>>24&255]+"-"+Dt[t&63|128]+Dt[t>>8&255]+"-"+Dt[t>>16&255]+Dt[t>>24&255]+Dt[n&255]+Dt[n>>8&255]+Dt[n>>16&255]+Dt[n>>24&255]).toLowerCase()}function je(i,e,t){return Math.max(e,Math.min(t,i))}function rf(i,e){return(i%e+e)%e}function ll(i,e,t){return(1-t)*i+t*e}function Ls(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ht(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var _e=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ct=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],f=r[o+0],p=r[o+1],_=r[o+2],y=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=_,e[t+3]=y;return}if(u!==y||l!==f||c!==p||h!==_){let m=1-a,d=l*f+c*p+h*_+u*y,b=d>=0?1:-1,x=1-d*d;if(x>Number.EPSILON){let R=Math.sqrt(x),T=Math.atan2(R,d*b);m=Math.sin(m*T)/R,a=Math.sin(a*T)/R}let g=a*b;if(l=l*m+f*g,c=c*m+p*g,h=h*m+_*g,u=u*m+y*g,m===1-a){let R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],f=r[o+1],p=r[o+2],_=r[o+3];return e[t]=a*_+h*u+l*p-c*f,e[t+1]=l*_+h*f+c*u-a*p,e[t+2]=c*_+h*p+a*f-l*u,e[t+3]=h*_-a*u-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),f=l(n/2),p=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=f*h*u+c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u-f*p*_;break;case"YXZ":this._x=f*h*u+c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u+f*p*_;break;case"ZXY":this._x=f*h*u-c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u-f*p*_;break;case"ZYX":this._x=f*h*u-c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u+f*p*_;break;case"YZX":this._x=f*h*u+c*p*_,this._y=c*p*u+f*h*_,this._z=c*h*_-f*p*u,this._w=c*h*u-f*p*_;break;case"XZY":this._x=f*h*u-c*p*_,this._y=c*p*u-f*h*_,this._z=c*h*_+f*p*u,this._w=c*h*u+f*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+a+u;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>u){let p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>u){let p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=o*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(rh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(rh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return cl.copy(this).projectOnVector(e),this.sub(cl)}reflect(e){return this.sub(cl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},cl=new U,rh=new Ct,qe=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],_=n[8],y=s[0],m=s[3],d=s[6],b=s[1],x=s[4],g=s[7],R=s[2],T=s[5],w=s[8];return r[0]=o*y+a*b+l*R,r[3]=o*m+a*x+l*T,r[6]=o*d+a*g+l*w,r[1]=c*y+h*b+u*R,r[4]=c*m+h*x+u*T,r[7]=c*d+h*g+u*w,r[2]=f*y+p*b+_*R,r[5]=f*m+p*x+_*T,r[8]=f*d+p*g+_*w,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,f=a*l-h*r,p=c*r-o*l,_=t*u+n*f+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/_;return e[0]=u*y,e[1]=(s*c-h*n)*y,e[2]=(a*n-s*o)*y,e[3]=f*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=p*y,e[7]=(n*l-c*t)*y,e[8]=(o*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(hl.makeScale(e,t)),this}rotate(e){return this.premultiply(hl.makeRotation(-e)),this}translate(e,t){return this.premultiply(hl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},hl=new qe;function lc(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Zs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function vu(){let i=Zs("canvas");return i.style.display="block",i}var oh={};function ns(i){i in oh||(oh[i]=!0,console.warn(i))}function Mu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var ah=new qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),lh=new qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function of(){let i={enabled:!0,workingColorSpace:bi,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===lt&&(s.r=Un(s.r),s.g=Un(s.g),s.b=Un(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===lt&&(s.r=es(s.r),s.g=es(s.g),s.b=es(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Hn?qs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ns("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ns("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[bi]:{primaries:e,whitePoint:n,transfer:qs,toXYZ:ah,fromXYZ:lh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:St},outputColorSpaceConfig:{drawingBufferColorSpace:St}},[St]:{primaries:e,whitePoint:n,transfer:lt,toXYZ:ah,fromXYZ:lh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:St}}}),i}var nt=of();function Un(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Hi,vo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Hi===void 0&&(Hi=Zs("canvas")),Hi.width=e.width,Hi.height=e.height;let s=Hi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Hi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Zs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Un(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Un(t[n]/255)*255):t[n]=Un(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},af=0,is=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:af++}),this.uuid=gs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(ul(s[o].image)):r.push(ul(s[o]))}else r=ul(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function ul(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?vo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var lf=0,dl=new U,Ot=class i extends Nn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Qn,s=Qn,r=Gt,o=ai,a=Xt,l=Sn,c=i.DEFAULT_ANISOTROPY,h=Hn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lf++}),this.uuid=gs(),this.name="",this.source=new is(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new _e(0,0),this.repeat=new _e(1,1),this.center=new _e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(dl).x}get height(){return this.source.getSize(dl).y}get depth(){return this.source.getSize(dl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==jl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case go:e.x=e.x-Math.floor(e.x);break;case Qn:e.x=e.x<0?0:1;break;case _o:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case go:e.y=e.y-Math.floor(e.y);break;case Qn:e.y=e.y<0?0:1;break;case _o:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=jl;Ot.DEFAULT_ANISOTROPY=1;var rt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],_=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-y)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+y)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,g=(p+1)/2,R=(d+1)/2,T=(h+f)/4,w=(u+y)/4,P=(_+m)/4;return x>g&&x>R?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=T/n,r=w/n):g>R?g<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(g),n=T/s,r=P/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=w/r,s=P/r),this.set(n,s,r,t),this}let b=Math.sqrt((m-_)*(m-_)+(u-y)*(u-y)+(f-h)*(f-h));return Math.abs(b)<.001&&(b=1),this.x=(m-_)/b,this.y=(u-y)/b,this.z=(f-h)/b,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this.w=je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this.w=je(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Mo=class extends Nn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Gt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rt(0,0,e,t),this.scissorTest=!1,this.viewport=new rt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new Ot(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:Gt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new is(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},hn=class extends Mo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Js=class extends Ot{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var So=class extends Ot{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Wt=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(mn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(mn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=mn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,mn):mn.fromBufferAttribute(r,o),mn.applyMatrix4(e.matrixWorld),this.expandByPoint(mn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Hr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Hr.copy(n.boundingBox)),Hr.applyMatrix4(e.matrixWorld),this.union(Hr)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,mn),mn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Us),Vr.subVectors(this.max,Us),Vi.subVectors(e.a,Us),Gi.subVectors(e.b,Us),Wi.subVectors(e.c,Us),qn.subVectors(Gi,Vi),Yn.subVectors(Wi,Gi),mi.subVectors(Vi,Wi);let t=[0,-qn.z,qn.y,0,-Yn.z,Yn.y,0,-mi.z,mi.y,qn.z,0,-qn.x,Yn.z,0,-Yn.x,mi.z,0,-mi.x,-qn.y,qn.x,0,-Yn.y,Yn.x,0,-mi.y,mi.x,0];return!fl(t,Vi,Gi,Wi,Vr)||(t=[1,0,0,0,1,0,0,0,1],!fl(t,Vi,Gi,Wi,Vr))?!1:(Gr.crossVectors(qn,Yn),t=[Gr.x,Gr.y,Gr.z],fl(t,Vi,Gi,Wi,Vr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,mn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(mn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Cn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Cn=[new U,new U,new U,new U,new U,new U,new U,new U],mn=new U,Hr=new Wt,Vi=new U,Gi=new U,Wi=new U,qn=new U,Yn=new U,mi=new U,Us=new U,Vr=new U,Gr=new U,gi=new U;function fl(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){gi.fromArray(i,r);let a=s.x*Math.abs(gi.x)+s.y*Math.abs(gi.y)+s.z*Math.abs(gi.z),l=e.dot(gi),c=t.dot(gi),h=n.dot(gi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var cf=new Wt,Ns=new U,pl=new U,yn=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):cf.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ns.subVectors(e,this.center);let t=Ns.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ns,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(pl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ns.copy(e.center).add(pl)),this.expandByPoint(Ns.copy(e.center).sub(pl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},In=new U,ml=new U,Wr=new U,Zn=new U,gl=new U,Xr=new U,_l=new U,$s=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,In)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=In.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(In.copy(this.origin).addScaledVector(this.direction,t),In.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){ml.copy(e).add(t).multiplyScalar(.5),Wr.copy(t).sub(e).normalize(),Zn.copy(this.origin).sub(ml);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Wr),a=Zn.dot(this.direction),l=-Zn.dot(Wr),c=Zn.lengthSq(),h=Math.abs(1-o*o),u,f,p,_;if(h>0)if(u=o*l-a,f=o*a-l,_=r*h,u>=0)if(f>=-_)if(f<=_){let y=1/h;u*=y,f*=y,p=u*(u+o*f+2*a)+f*(o*u+f+2*l)+c}else f=r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;else f<=-_?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=_?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(ml).addScaledVector(Wr,f),p}intersectSphere(e,t){In.subVectors(e.center,this.origin);let n=In.dot(this.direction),s=In.dot(In)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,In)!==null}intersectTriangle(e,t,n,s,r){gl.subVectors(t,e),Xr.subVectors(n,e),_l.crossVectors(gl,Xr);let o=this.direction.dot(_l),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Zn.subVectors(this.origin,e);let l=a*this.direction.dot(Xr.crossVectors(Zn,Xr));if(l<0)return null;let c=a*this.direction.dot(gl.cross(Zn));if(c<0||l+c>o)return null;let h=-a*Zn.dot(_l);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Qe=class i{constructor(e,t,n,s,r,o,a,l,c,h,u,f,p,_,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,f,p,_,y,m)}set(e,t,n,s,r,o,a,l,c,h,u,f,p,_,y,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=_,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Xi.setFromMatrixColumn(e,0).length(),r=1/Xi.setFromMatrixColumn(e,1).length(),o=1/Xi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let f=o*h,p=o*u,_=a*h,y=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+_*c,t[5]=f-y*c,t[9]=-a*l,t[2]=y-f*c,t[6]=_+p*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*h,p=l*u,_=c*h,y=c*u;t[0]=f+y*a,t[4]=_*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-_,t[6]=y+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*h,p=l*u,_=c*h,y=c*u;t[0]=f-y*a,t[4]=-o*u,t[8]=_+p*a,t[1]=p+_*a,t[5]=o*h,t[9]=y-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*h,p=o*u,_=a*h,y=a*u;t[0]=l*h,t[4]=_*c-p,t[8]=f*c+y,t[1]=l*u,t[5]=y*c+f,t[9]=p*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,p=o*c,_=a*l,y=a*c;t[0]=l*h,t[4]=y-f*u,t[8]=_*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+_,t[10]=f-y*u}else if(e.order==="XZY"){let f=o*l,p=o*c,_=a*l,y=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+y,t[5]=o*h,t[9]=p*u-_,t[2]=_*u-p,t[6]=a*h,t[10]=y*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(hf,e,uf)}lookAt(e,t,n){let s=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),Jn.crossVectors(n,jt),Jn.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),Jn.crossVectors(n,jt)),Jn.normalize(),qr.crossVectors(jt,Jn),s[0]=Jn.x,s[4]=qr.x,s[8]=jt.x,s[1]=Jn.y,s[5]=qr.y,s[9]=jt.y,s[2]=Jn.z,s[6]=qr.z,s[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],_=n[2],y=n[6],m=n[10],d=n[14],b=n[3],x=n[7],g=n[11],R=n[15],T=s[0],w=s[4],P=s[8],S=s[12],v=s[1],E=s[5],L=s[9],B=s[13],q=s[2],z=s[6],V=s[10],$=s[14],G=s[3],ue=s[7],me=s[11],Se=s[15];return r[0]=o*T+a*v+l*q+c*G,r[4]=o*w+a*E+l*z+c*ue,r[8]=o*P+a*L+l*V+c*me,r[12]=o*S+a*B+l*$+c*Se,r[1]=h*T+u*v+f*q+p*G,r[5]=h*w+u*E+f*z+p*ue,r[9]=h*P+u*L+f*V+p*me,r[13]=h*S+u*B+f*$+p*Se,r[2]=_*T+y*v+m*q+d*G,r[6]=_*w+y*E+m*z+d*ue,r[10]=_*P+y*L+m*V+d*me,r[14]=_*S+y*B+m*$+d*Se,r[3]=b*T+x*v+g*q+R*G,r[7]=b*w+x*E+g*z+R*ue,r[11]=b*P+x*L+g*V+R*me,r[15]=b*S+x*B+g*$+R*Se,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],p=e[14],_=e[3],y=e[7],m=e[11],d=e[15];return _*(+r*l*u-s*c*u-r*a*f+n*c*f+s*a*p-n*l*p)+y*(+t*l*p-t*c*f+r*o*f-s*o*p+s*c*h-r*l*h)+m*(+t*c*u-t*a*p-r*o*u+n*o*p+r*a*h-n*c*h)+d*(-s*a*h-t*l*u+t*a*f+s*o*u-n*o*f+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],p=e[11],_=e[12],y=e[13],m=e[14],d=e[15],b=u*m*c-y*f*c+y*l*p-a*m*p-u*l*d+a*f*d,x=_*f*c-h*m*c-_*l*p+o*m*p+h*l*d-o*f*d,g=h*y*c-_*u*c+_*a*p-o*y*p-h*a*d+o*u*d,R=_*u*l-h*y*l-_*a*f+o*y*f+h*a*m-o*u*m,T=t*b+n*x+s*g+r*R;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let w=1/T;return e[0]=b*w,e[1]=(y*f*r-u*m*r-y*s*p+n*m*p+u*s*d-n*f*d)*w,e[2]=(a*m*r-y*l*r+y*s*c-n*m*c-a*s*d+n*l*d)*w,e[3]=(u*l*r-a*f*r-u*s*c+n*f*c+a*s*p-n*l*p)*w,e[4]=x*w,e[5]=(h*m*r-_*f*r+_*s*p-t*m*p-h*s*d+t*f*d)*w,e[6]=(_*l*r-o*m*r-_*s*c+t*m*c+o*s*d-t*l*d)*w,e[7]=(o*f*r-h*l*r+h*s*c-t*f*c-o*s*p+t*l*p)*w,e[8]=g*w,e[9]=(_*u*r-h*y*r-_*n*p+t*y*p+h*n*d-t*u*d)*w,e[10]=(o*y*r-_*a*r+_*n*c-t*y*c-o*n*d+t*a*d)*w,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*p-t*a*p)*w,e[12]=R*w,e[13]=(h*y*s-_*u*s+_*n*f-t*y*f-h*n*m+t*u*m)*w,e[14]=(_*a*s-o*y*s-_*n*l+t*y*l+o*n*m-t*a*m)*w,e[15]=(o*u*s-h*a*s+h*n*l-t*u*l-o*n*f+t*a*f)*w,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,f=r*c,p=r*h,_=r*u,y=o*h,m=o*u,d=a*u,b=l*c,x=l*h,g=l*u,R=n.x,T=n.y,w=n.z;return s[0]=(1-(y+d))*R,s[1]=(p+g)*R,s[2]=(_-x)*R,s[3]=0,s[4]=(p-g)*T,s[5]=(1-(f+d))*T,s[6]=(m+b)*T,s[7]=0,s[8]=(_+x)*w,s[9]=(m-b)*w,s[10]=(1-(f+y))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Xi.set(s[0],s[1],s[2]).length(),o=Xi.set(s[4],s[5],s[6]).length(),a=Xi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],gn.copy(this);let c=1/r,h=1/o,u=1/a;return gn.elements[0]*=c,gn.elements[1]*=c,gn.elements[2]*=c,gn.elements[4]*=h,gn.elements[5]*=h,gn.elements[6]*=h,gn.elements[8]*=u,gn.elements[9]*=u,gn.elements[10]*=u,t.setFromRotationMatrix(gn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=xn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s),_,y;if(l)_=r/(o-r),y=o*r/(o-r);else if(a===xn)_=-(o+r)/(o-r),y=-2*o*r/(o-r);else if(a===Ys)_=-o/(o-r),y=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=xn,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s),_,y;if(l)_=1/(o-r),y=o/(o-r);else if(a===xn)_=-2/(o-r),y=-(o+r)/(o-r);else if(a===Ys)_=-1/(o-r),y=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=_,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Xi=new U,gn=new Qe,hf=new U(0,0,0),uf=new U(1,1,1),Jn=new U,qr=new U,jt=new U,ch=new Qe,hh=new Ct,un=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(je(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-je(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ch.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ch,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return hh.setFromEuler(this),this.setFromQuaternion(hh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};un.DEFAULT_ORDER="XYZ";var Ks=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},df=0,uh=new U,qi=new Ct,Pn=new Qe,Yr=new U,Fs=new U,ff=new U,pf=new Ct,dh=new U(1,0,0),fh=new U(0,1,0),ph=new U(0,0,1),mh={type:"added"},mf={type:"removed"},Yi={type:"childadded",child:null},xl={type:"childremoved",child:null},vt=class i extends Nn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:df++}),this.uuid=gs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new U,t=new un,n=new Ct,s=new U(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Qe},normalMatrix:{value:new qe}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ks,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return qi.setFromAxisAngle(e,t),this.quaternion.multiply(qi),this}rotateOnWorldAxis(e,t){return qi.setFromAxisAngle(e,t),this.quaternion.premultiply(qi),this}rotateX(e){return this.rotateOnAxis(dh,e)}rotateY(e){return this.rotateOnAxis(fh,e)}rotateZ(e){return this.rotateOnAxis(ph,e)}translateOnAxis(e,t){return uh.copy(e).applyQuaternion(this.quaternion),this.position.add(uh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(dh,e)}translateY(e){return this.translateOnAxis(fh,e)}translateZ(e){return this.translateOnAxis(ph,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Yr.copy(e):Yr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Pn.lookAt(Fs,Yr,this.up):Pn.lookAt(Yr,Fs,this.up),this.quaternion.setFromRotationMatrix(Pn),s&&(Pn.extractRotation(s.matrixWorld),qi.setFromRotationMatrix(Pn),this.quaternion.premultiply(qi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(mh),Yi.child=e,this.dispatchEvent(Yi),Yi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(mf),xl.child=e,this.dispatchEvent(xl),xl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(mh),Yi.child=e,this.dispatchEvent(Yi),Yi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fs,e,ff),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fs,pf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),p=o(e.animations),_=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),_.length>0&&(n.nodes=_)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};vt.DEFAULT_UP=new U(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _n=new U,Dn=new U,yl=new U,Ln=new U,Zi=new U,Ji=new U,gh=new U,vl=new U,Ml=new U,Sl=new U,bl=new rt,El=new rt,wl=new rt,jn=class i{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),_n.subVectors(e,t),s.cross(_n);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){_n.subVectors(s,t),Dn.subVectors(n,t),yl.subVectors(e,t);let o=_n.dot(_n),a=_n.dot(Dn),l=_n.dot(yl),c=Dn.dot(Dn),h=Dn.dot(yl),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let f=1/u,p=(c*l-a*h)*f,_=(o*h-a*l)*f;return r.set(1-p-_,_,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Ln)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ln.x),l.addScaledVector(o,Ln.y),l.addScaledVector(a,Ln.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return bl.setScalar(0),El.setScalar(0),wl.setScalar(0),bl.fromBufferAttribute(e,t),El.fromBufferAttribute(e,n),wl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(bl,r.x),o.addScaledVector(El,r.y),o.addScaledVector(wl,r.z),o}static isFrontFacing(e,t,n,s){return _n.subVectors(n,t),Dn.subVectors(e,t),_n.cross(Dn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _n.subVectors(this.c,this.b),Dn.subVectors(this.a,this.b),_n.cross(Dn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;Zi.subVectors(s,n),Ji.subVectors(r,n),vl.subVectors(e,n);let l=Zi.dot(vl),c=Ji.dot(vl);if(l<=0&&c<=0)return t.copy(n);Ml.subVectors(e,s);let h=Zi.dot(Ml),u=Ji.dot(Ml);if(h>=0&&u<=h)return t.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(Zi,o);Sl.subVectors(e,r);let p=Zi.dot(Sl),_=Ji.dot(Sl);if(_>=0&&p<=_)return t.copy(r);let y=p*c-l*_;if(y<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(n).addScaledVector(Ji,a);let m=h*_-p*u;if(m<=0&&u-h>=0&&p-_>=0)return gh.subVectors(r,s),a=(u-h)/(u-h+(p-_)),t.copy(s).addScaledVector(gh,a);let d=1/(m+y+f);return o=y*d,a=f*d,t.copy(n).addScaledVector(Zi,o).addScaledVector(Ji,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Su={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$n={h:0,s:0,l:0},Zr={h:0,s:0,l:0};function Tl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var He=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=St){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=nt.workingColorSpace){return this.r=e,this.g=t,this.b=n,nt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=nt.workingColorSpace){if(e=rf(e,1),t=je(t,0,1),n=je(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Tl(o,r,e+1/3),this.g=Tl(o,r,e),this.b=Tl(o,r,e-1/3)}return nt.colorSpaceToWorking(this,s),this}setStyle(e,t=St){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=St){let n=Su[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Un(e.r),this.g=Un(e.g),this.b=Un(e.b),this}copyLinearToSRGB(e){return this.r=es(e.r),this.g=es(e.g),this.b=es(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=St){return nt.workingToColorSpace(Lt.copy(this),e),Math.round(je(Lt.r*255,0,255))*65536+Math.round(je(Lt.g*255,0,255))*256+Math.round(je(Lt.b*255,0,255))}getHexString(e=St){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(Lt.copy(this),t);let n=Lt.r,s=Lt.g,r=Lt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(Lt.copy(this),t),e.r=Lt.r,e.g=Lt.g,e.b=Lt.b,e}getStyle(e=St){nt.workingToColorSpace(Lt.copy(this),e);let t=Lt.r,n=Lt.g,s=Lt.b;return e!==St?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL($n),this.setHSL($n.h+e,$n.s+t,$n.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL($n),e.getHSL(Zr);let n=ll($n.h,Zr.h,t),s=ll($n.s,Zr.s,t),r=ll($n.l,Zr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Lt=new He;He.NAMES=Su;var gf=0,wn=class extends Nn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gf++}),this.uuid=gs(),this.name="",this.type="Material",this.blending=Mi,this.side=Vt,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=po,this.blendDst=mo,this.blendEquation=ei,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new He(0,0,0),this.blendAlpha=0,this.depthFunc=Si,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=kl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=yi,this.stencilZFail=yi,this.stencilZPass=yi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Mi&&(n.blending=this.blending),this.side!==Vt&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==po&&(n.blendSrc=this.blendSrc),this.blendDst!==mo&&(n.blendDst=this.blendDst),this.blendEquation!==ei&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Si&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==kl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==yi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==yi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==yi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},en=class extends wn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=Qo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var yt=new U,Jr=new _e,_f=0,Ve=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_f++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Hl,this.updateRanges=[],this.gpuType=sn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Jr.fromBufferAttribute(this,t),Jr.applyMatrix3(e),this.setXY(t,Jr.x,Jr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix3(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix4(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.applyNormalMatrix(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)yt.fromBufferAttribute(this,t),yt.transformDirection(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ls(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ls(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ls(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ls(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ls(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ht(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),s=Ht(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ht(t,this.array),n=Ht(n,this.array),s=Ht(s,this.array),r=Ht(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Hl&&(e.usage=this.usage),e}};var ti=class extends Ve{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var ni=class extends Ve{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var at=class extends Ve{constructor(e,t,n){super(new Float32Array(e),t,n)}},xf=0,cn=new Qe,Al=new vt,$i=new U,Qt=new Wt,Os=new Wt,Tt=new U,it=class i extends Nn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:xf++}),this.uuid=gs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(lc(e)?ni:ti)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new qe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return cn.makeRotationFromQuaternion(e),this.applyMatrix4(cn),this}rotateX(e){return cn.makeRotationX(e),this.applyMatrix4(cn),this}rotateY(e){return cn.makeRotationY(e),this.applyMatrix4(cn),this}rotateZ(e){return cn.makeRotationZ(e),this.applyMatrix4(cn),this}translate(e,t,n){return cn.makeTranslation(e,t,n),this.applyMatrix4(cn),this}scale(e,t,n){return cn.makeScale(e,t,n),this.applyMatrix4(cn),this}lookAt(e){return Al.lookAt(e),Al.updateMatrix(),this.applyMatrix4(Al.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter($i).negate(),this.translate($i.x,$i.y,$i.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new at(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Qt.setFromBufferAttribute(r),this.morphTargetsRelative?(Tt.addVectors(this.boundingBox.min,Qt.min),this.boundingBox.expandByPoint(Tt),Tt.addVectors(this.boundingBox.max,Qt.max),this.boundingBox.expandByPoint(Tt)):(this.boundingBox.expandByPoint(Qt.min),this.boundingBox.expandByPoint(Qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new yn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(e){let n=this.boundingSphere.center;if(Qt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Os.setFromBufferAttribute(a),this.morphTargetsRelative?(Tt.addVectors(Qt.min,Os.min),Qt.expandByPoint(Tt),Tt.addVectors(Qt.max,Os.max),Qt.expandByPoint(Tt)):(Qt.expandByPoint(Os.min),Qt.expandByPoint(Os.max))}Qt.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Tt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Tt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Tt.fromBufferAttribute(a,c),l&&($i.fromBufferAttribute(e,c),Tt.add($i)),s=Math.max(s,n.distanceToSquared(Tt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ve(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new U,l[P]=new U;let c=new U,h=new U,u=new U,f=new _e,p=new _e,_=new _e,y=new U,m=new U;function d(P,S,v){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,v),f.fromBufferAttribute(r,P),p.fromBufferAttribute(r,S),_.fromBufferAttribute(r,v),h.sub(c),u.sub(c),p.sub(f),_.sub(f);let E=1/(p.x*_.y-_.x*p.y);isFinite(E)&&(y.copy(h).multiplyScalar(_.y).addScaledVector(u,-p.y).multiplyScalar(E),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-_.x).multiplyScalar(E),a[P].add(y),a[S].add(y),a[v].add(y),l[P].add(m),l[S].add(m),l[v].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let P=0,S=b.length;P<S;++P){let v=b[P],E=v.start,L=v.count;for(let B=E,q=E+L;B<q;B+=3)d(e.getX(B+0),e.getX(B+1),e.getX(B+2))}let x=new U,g=new U,R=new U,T=new U;function w(P){R.fromBufferAttribute(s,P),T.copy(R);let S=a[P];x.copy(S),x.sub(R.multiplyScalar(R.dot(S))).normalize(),g.crossVectors(T,S);let E=g.dot(l[P])<0?-1:1;o.setXYZW(P,x.x,x.y,x.z,E)}for(let P=0,S=b.length;P<S;++P){let v=b[P],E=v.start,L=v.count;for(let B=E,q=E+L;B<q;B+=3)w(e.getX(B+0)),w(e.getX(B+1)),w(e.getX(B+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ve(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new U,r=new U,o=new U,a=new U,l=new U,c=new U,h=new U,u=new U;if(e)for(let f=0,p=e.count;f<p;f+=3){let _=e.getX(f+0),y=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Tt.fromBufferAttribute(e,t),Tt.normalize(),e.setXYZ(t,Tt.x,Tt.y,Tt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,f=new c.constructor(l.length*h),p=0,_=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?p=l[y]*a.data.stride+a.offset:p=l[y]*h;for(let d=0;d<h;d++)f[_++]=c[p++]}return new Ve(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let f=c[h],p=e(f,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},_h=new Qe,_i=new $s,$r=new yn,xh=new U,Kr=new U,jr=new U,Qr=new U,Rl=new U,eo=new U,yh=new U,to=new U,Ke=class extends vt{constructor(e=new it,t=new en){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){eo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Rl.fromBufferAttribute(u,e),o?eo.addScaledVector(Rl,h):eo.addScaledVector(Rl.sub(t),h))}t.add(eo)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),$r.copy(n.boundingSphere),$r.applyMatrix4(r),_i.copy(e.ray).recast(e.near),!($r.containsPoint(_i.origin)===!1&&(_i.intersectSphere($r,xh)===null||_i.origin.distanceToSquared(xh)>(e.far-e.near)**2))&&(_h.copy(r).invert(),_i.copy(e.ray).applyMatrix4(_h),!(n.boundingBox!==null&&_i.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,_i)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,y=f.length;_<y;_++){let m=f[_],d=o[m.materialIndex],b=Math.max(m.start,p.start),x=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let g=b,R=x;g<R;g+=3){let T=a.getX(g),w=a.getX(g+1),P=a.getX(g+2);s=no(this,d,e,n,c,h,u,T,w,P),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),y=Math.min(a.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){let b=a.getX(m),x=a.getX(m+1),g=a.getX(m+2);s=no(this,o,e,n,c,h,u,b,x,g),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,y=f.length;_<y;_++){let m=f[_],d=o[m.materialIndex],b=Math.max(m.start,p.start),x=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let g=b,R=x;g<R;g+=3){let T=g,w=g+1,P=g+2;s=no(this,d,e,n,c,h,u,T,w,P),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let _=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){let b=m,x=m+1,g=m+2;s=no(this,o,e,n,c,h,u,b,x,g),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function yf(i,e,t,n,s,r,o,a){let l;if(e.side===Mt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Vt,a),l===null)return null;to.copy(a),to.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(to);return c<t.near||c>t.far?null:{distance:c,point:to.clone(),object:i}}function no(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Kr),i.getVertexPosition(l,jr),i.getVertexPosition(c,Qr);let h=yf(i,e,t,n,Kr,jr,Qr,yh);if(h){let u=new U;jn.getBarycoord(yh,Kr,jr,Qr,u),s&&(h.uv=jn.getInterpolatedAttribute(s,a,l,c,u,new _e)),r&&(h.uv1=jn.getInterpolatedAttribute(r,a,l,c,u,new _e)),o&&(h.normal=jn.getInterpolatedAttribute(o,a,l,c,u,new U),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new U,materialIndex:0};jn.getNormal(Kr,jr,Qr,f.normal),h.face=f,h.barycoord=u}return h}var dn=class i extends it{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],f=0,p=0;_("z","y","x",-1,-1,n,t,e,o,r,0),_("z","y","x",1,-1,n,t,-e,o,r,1),_("x","z","y",1,1,e,n,t,s,o,2),_("x","z","y",1,-1,e,n,-t,s,o,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new at(c,3)),this.setAttribute("normal",new at(h,3)),this.setAttribute("uv",new at(u,2));function _(y,m,d,b,x,g,R,T,w,P,S){let v=g/w,E=R/P,L=g/2,B=R/2,q=T/2,z=w+1,V=P+1,$=0,G=0,ue=new U;for(let me=0;me<V;me++){let Se=me*E-B;for(let Me=0;Me<z;Me++){let Fe=Me*v-L;ue[y]=Fe*b,ue[m]=Se*x,ue[d]=q,c.push(ue.x,ue.y,ue.z),ue[y]=0,ue[m]=0,ue[d]=T>0?1:-1,h.push(ue.x,ue.y,ue.z),u.push(Me/w),u.push(1-me/P),$+=1}}for(let me=0;me<P;me++)for(let Se=0;Se<w;Se++){let Me=f+Se+z*me,Fe=f+Se+z*(me+1),Ze=f+(Se+1)+z*(me+1),Ye=f+(Se+1)+z*me;l.push(Me,Fe,Ye),l.push(Fe,Ze,Ye),G+=6}a.addGroup(p,G,S),p+=G,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ii(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Nt(i){let e={};for(let t=0;t<i.length;t++){let n=Ii(i[t]);for(let s in n)e[s]=n[s]}return e}function vf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function cc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}var bu={clone:Ii,merge:Nt},Mf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,vn=class extends wn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mf,this.fragmentShader=Sf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ii(e.uniforms),this.uniformsGroups=vf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},js=class extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=xn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Kn=new U,vh=new _e,Mh=new _e,Rt=class extends js{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=yo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(al*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return yo*2*Math.atan(Math.tan(al*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Kn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Kn.x,Kn.y).multiplyScalar(-e/Kn.z),Kn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Kn.x,Kn.y).multiplyScalar(-e/Kn.z)}getViewSize(e,t){return this.getViewBounds(e,vh,Mh),t.subVectors(Mh,vh)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(al*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ki=-90,ji=1,bo=class extends vt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Rt(Ki,ji,e,t);s.layers=this.layers,this.add(s);let r=new Rt(Ki,ji,e,t);r.layers=this.layers,this.add(r);let o=new Rt(Ki,ji,e,t);o.layers=this.layers,this.add(o);let a=new Rt(Ki,ji,e,t);a.layers=this.layers,this.add(a);let l=new Rt(Ki,ji,e,t);l.layers=this.layers,this.add(l);let c=new Rt(Ki,ji,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===xn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ys)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,p),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Qs=class extends Ot{constructor(e=[],t=Ri,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Eo=class extends hn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Qs(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new dn(5,5,5),r=new vn({name:"CubemapFromEquirect",uniforms:Ii(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Mt,blending:zn});r.uniforms.tEquirect.value=t;let o=new Ke(s,r),a=t.minFilter;return t.minFilter===ai&&(t.minFilter=Gt),new bo(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},ot=class extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}},bf={type:"move"},ss=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ot,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ot,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ot,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),d=this._getHandJoint(c,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,_=.005;c.inputState.pinching&&f>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(bf)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new ot;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Fn=class extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new un,this.environmentIntensity=1,this.environmentRotation=new un,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var ii=class extends Ot{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Ut,h=Ut,u,f){super(null,o,a,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var er=class extends Ve{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Qi=new Qe,Sh=new Qe,io=[],bh=new Wt,Ef=new Qe,Bs=new Ke,zs=new yn,tr=class extends Ke{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new er(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ef)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Wt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Qi),bh.copy(e.boundingBox).applyMatrix4(Qi),this.boundingBox.union(bh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new yn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Qi),zs.copy(e.boundingSphere).applyMatrix4(Qi),this.boundingSphere.union(zs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Bs.geometry=this.geometry,Bs.material=this.material,Bs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),zs.copy(this.boundingSphere),zs.applyMatrix4(n),e.ray.intersectsSphere(zs)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Qi),Sh.multiplyMatrices(n,Qi),Bs.matrixWorld=Sh,Bs.raycast(e,io);for(let o=0,a=io.length;o<a;o++){let l=io[o];l.instanceId=r,l.object=this,t.push(l)}io.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new er(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new ii(new Float32Array(s*this.count),s,this.count,aa,sn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Cl=new U,wf=new U,Tf=new qe,En=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Cl.subVectors(n,t).cross(wf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(Cl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Tf.getNormalMatrix(e),s=this.coplanarPoint(Cl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},xi=new yn,Af=new _e(.5,.5),so=new U,rs=class{constructor(e=new En,t=new En,n=new En,s=new En,r=new En,o=new En){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=xn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],p=r[7],_=r[8],y=r[9],m=r[10],d=r[11],b=r[12],x=r[13],g=r[14],R=r[15];if(s[0].setComponents(c-o,p-h,d-_,R-b).normalize(),s[1].setComponents(c+o,p+h,d+_,R+b).normalize(),s[2].setComponents(c+a,p+u,d+y,R+x).normalize(),s[3].setComponents(c-a,p-u,d-y,R-x).normalize(),n)s[4].setComponents(l,f,m,g).normalize(),s[5].setComponents(c-l,p-f,d-m,R-g).normalize();else if(s[4].setComponents(c-l,p-f,d-m,R-g).normalize(),t===xn)s[5].setComponents(c+l,p+f,d+m,R+g).normalize();else if(t===Ys)s[5].setComponents(l,f,m,g).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),xi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),xi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(xi)}intersectsSprite(e){xi.center.set(0,0,0);let t=Af.distanceTo(e.center);return xi.radius=.7071067811865476+t,xi.applyMatrix4(e.matrixWorld),this.intersectsSphere(xi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(so.x=s.normal.x>0?e.max.x:e.min.x,so.y=s.normal.y>0?e.max.y:e.min.y,so.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(so)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var On=class extends wn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new He(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},wo=new U,To=new U,Eh=new Qe,ks=new $s,ro=new yn,Il=new U,wh=new U,Ei=class extends vt{constructor(e=new it,t=new On){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)wo.fromBufferAttribute(t,s-1),To.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=wo.distanceTo(To);e.setAttribute("lineDistance",new at(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ro.copy(n.boundingSphere),ro.applyMatrix4(s),ro.radius+=r,e.ray.intersectsSphere(ro)===!1)return;Eh.copy(s).invert(),ks.copy(e.ray).applyMatrix4(Eh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){let p=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let y=p,m=_-1;y<m;y+=c){let d=h.getX(y),b=h.getX(y+1),x=oo(this,e,ks,l,d,b,y);x&&t.push(x)}if(this.isLineLoop){let y=h.getX(_-1),m=h.getX(p),d=oo(this,e,ks,l,y,m,_-1);d&&t.push(d)}}else{let p=Math.max(0,o.start),_=Math.min(f.count,o.start+o.count);for(let y=p,m=_-1;y<m;y+=c){let d=oo(this,e,ks,l,y,y+1,y);d&&t.push(d)}if(this.isLineLoop){let y=oo(this,e,ks,l,_-1,p,_-1);y&&t.push(y)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function oo(i,e,t,n,s,r,o){let a=i.geometry.attributes.position;if(wo.fromBufferAttribute(a,s),To.fromBufferAttribute(a,r),t.distanceSqToSegment(wo,To,Il,wh)>n)return;Il.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Il);if(!(c<e.near||c>e.far))return{distance:c,point:wh.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var Th=new U,Ah=new U,nr=class extends Ei{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Th.fromBufferAttribute(t,s),Ah.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Th.distanceTo(Ah);e.setAttribute("lineDistance",new at(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var ir=class extends Ot{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},sr=class extends Ot{constructor(e,t,n=li,s,r,o,a=Ut,l=Ut,c,h=ts,u=1){if(h!==ts&&h!==fs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:u};super(f,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new is(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},rr=class extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var _t=class i extends it{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],f=[],p=[],_=0,y=[],m=n/2,d=0;b(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new at(u,3)),this.setAttribute("normal",new at(f,3)),this.setAttribute("uv",new at(p,2));function b(){let g=new U,R=new U,T=0,w=(t-e)/n;for(let P=0;P<=r;P++){let S=[],v=P/r,E=v*(t-e)+e;for(let L=0;L<=s;L++){let B=L/s,q=B*l+a,z=Math.sin(q),V=Math.cos(q);R.x=E*z,R.y=-v*n+m,R.z=E*V,u.push(R.x,R.y,R.z),g.set(z,w,V).normalize(),f.push(g.x,g.y,g.z),p.push(B,1-v),S.push(_++)}y.push(S)}for(let P=0;P<s;P++)for(let S=0;S<r;S++){let v=y[S][P],E=y[S+1][P],L=y[S+1][P+1],B=y[S][P+1];(e>0||S!==0)&&(h.push(v,E,B),T+=3),(t>0||S!==r-1)&&(h.push(E,L,B),T+=3)}c.addGroup(d,T,0),d+=T}function x(g){let R=_,T=new _e,w=new U,P=0,S=g===!0?e:t,v=g===!0?1:-1;for(let L=1;L<=s;L++)u.push(0,m*v,0),f.push(0,v,0),p.push(.5,.5),_++;let E=_;for(let L=0;L<=s;L++){let q=L/s*l+a,z=Math.cos(q),V=Math.sin(q);w.x=S*V,w.y=m*v,w.z=S*z,u.push(w.x,w.y,w.z),f.push(0,v,0),T.x=z*.5+.5,T.y=V*.5*v+.5,p.push(T.x,T.y),_++}for(let L=0;L<s;L++){let B=R+L,q=E+L;g===!0?h.push(q,q+1,B):h.push(q+1,q,B),P+=3}c.addGroup(d,P,g===!0?1:2),d+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ao=class i extends _t{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var tn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],f=n[s+1]-h,p=(o-h)/f;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new _e:new U);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new U,s=[],r=[],o=[],a=new U,l=new Qe;for(let p=0;p<=e;p++){let _=p/e;s[p]=this.getTangentAt(_,new U)}r[0]=new U,o[0]=new U;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();let _=Math.acos(je(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,_))}o[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(je(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let _=1;_<=e;_++)r[_].applyMatrix4(l.makeRotationAxis(s[_],p*_)),o[_].crossVectors(s[_],r[_])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},os=class extends tn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new _e){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,p=c-this.aY;l=f*h-p*u+this.aX,c=f*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Ro=class extends os{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function hc(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,p*=h,s(o,a,f,p)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var ao=new U,Pl=new hc,Dl=new hc,Ll=new hc,Mn=class extends tn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new U){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(ao.subVectors(s[0],s[1]).add(s[0]),c=ao);let u=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(ao.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=ao),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,_=Math.pow(c.distanceToSquared(u),p),y=Math.pow(u.distanceToSquared(f),p),m=Math.pow(f.distanceToSquared(h),p);y<1e-4&&(y=1),_<1e-4&&(_=y),m<1e-4&&(m=y),Pl.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,_,y,m),Dl.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,_,y,m),Ll.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,_,y,m)}else this.curveType==="catmullrom"&&(Pl.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),Dl.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Ll.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(Pl.calc(l),Dl.calc(l),Ll.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new U().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Rh(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function Rf(i,e){let t=1-i;return t*t*e}function Cf(i,e){return 2*(1-i)*i*e}function If(i,e){return i*i*e}function Gs(i,e,t,n){return Rf(i,e)+Cf(i,t)+If(i,n)}function Pf(i,e){let t=1-i;return t*t*t*e}function Df(i,e){let t=1-i;return 3*t*t*i*e}function Lf(i,e){return 3*(1-i)*i*i*e}function Uf(i,e){return i*i*i*e}function Ws(i,e,t,n,s){return Pf(i,e)+Df(i,t)+Lf(i,n)+Uf(i,s)}var or=class extends tn{constructor(e=new _e,t=new _e,n=new _e,s=new _e){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new _e){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ws(e,s.x,r.x,o.x,a.x),Ws(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Co=class extends tn{constructor(e=new U,t=new U,n=new U,s=new U){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new U){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ws(e,s.x,r.x,o.x,a.x),Ws(e,s.y,r.y,o.y,a.y),Ws(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ar=class extends tn{constructor(e=new _e,t=new _e){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new _e){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new _e){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Io=class extends tn{constructor(e=new U,t=new U){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new U){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new U){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},lr=class extends tn{constructor(e=new _e,t=new _e,n=new _e){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new _e){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Gs(e,s.x,r.x,o.x),Gs(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},cr=class extends tn{constructor(e=new U,t=new U,n=new U){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new U){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Gs(e,s.x,r.x,o.x),Gs(e,s.y,r.y,o.y),Gs(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},hr=class extends tn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new _e){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Rh(a,l.x,c.x,h.x,u.x),Rh(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new _e().fromArray(s))}return this}},Po=Object.freeze({__proto__:null,ArcCurve:Ro,CatmullRomCurve3:Mn,CubicBezierCurve:or,CubicBezierCurve3:Co,EllipseCurve:os,LineCurve:ar,LineCurve3:Io,QuadraticBezierCurve:lr,QuadraticBezierCurve3:cr,SplineCurve:hr}),Do=class extends tn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Po[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Po[s.type]().fromJSON(s))}return this}},ur=class extends Do{constructor(e){super(),this.type="Path",this.currentPoint=new _e,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new ar(this.currentPoint.clone(),new _e(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new lr(this.currentPoint.clone(),new _e(e,t),new _e(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new or(this.currentPoint.clone(),new _e(e,t),new _e(n,s),new _e(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new hr(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new os(e,t,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},as=class extends ur{constructor(e){super(e),this.uuid=gs(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new ur().fromJSON(s))}return this}};function Nf(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Eu(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=kf(i,e,r,t)),i.length>80*t){a=1/0,l=1/0;let h=-1/0,u=-1/0;for(let f=t;f<s;f+=t){let p=i[f],_=i[f+1];p<a&&(a=p),_<l&&(l=_),p>h&&(h=p),_>u&&(u=_)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return dr(r,o,t,a,l,c,0),o}function Eu(i,e,t,n,s){let r;if(s===Kf(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Ch(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Ch(o/n|0,i[o],i[o+1],r);return r&&ls(r,r.next)&&(pr(r),r=r.next),r}function wi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(ls(t,t.next)||mt(t.prev,t,t.next)===0)){if(pr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function dr(i,e,t,n,s,r,o){if(!i)return;!o&&r&&Xf(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Of(i,n,s,r):Ff(i)){e.push(l.i,i.i,c.i),pr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Bf(wi(i),e),dr(i,e,t,n,s,r,2)):o===2&&zf(i,e,t,n,s,r):dr(wi(i),e,t,n,s,r,1);break}}}function Ff(i){let e=i.prev,t=i,n=i.next;if(mt(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=Math.min(s,r,o),u=Math.min(a,l,c),f=Math.max(s,r,o),p=Math.max(a,l,c),_=n.next;for(;_!==e;){if(_.x>=h&&_.x<=f&&_.y>=u&&_.y<=p&&Vs(s,a,r,l,o,c,_.x,_.y)&&mt(_.prev,_,_.next)>=0)return!1;_=_.next}return!0}function Of(i,e,t,n){let s=i.prev,r=i,o=i.next;if(mt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,f=o.y,p=Math.min(a,l,c),_=Math.min(h,u,f),y=Math.max(a,l,c),m=Math.max(h,u,f),d=Vl(p,_,e,t,n),b=Vl(y,m,e,t,n),x=i.prevZ,g=i.nextZ;for(;x&&x.z>=d&&g&&g.z<=b;){if(x.x>=p&&x.x<=y&&x.y>=_&&x.y<=m&&x!==s&&x!==o&&Vs(a,h,l,u,c,f,x.x,x.y)&&mt(x.prev,x,x.next)>=0||(x=x.prevZ,g.x>=p&&g.x<=y&&g.y>=_&&g.y<=m&&g!==s&&g!==o&&Vs(a,h,l,u,c,f,g.x,g.y)&&mt(g.prev,g,g.next)>=0))return!1;g=g.nextZ}for(;x&&x.z>=d;){if(x.x>=p&&x.x<=y&&x.y>=_&&x.y<=m&&x!==s&&x!==o&&Vs(a,h,l,u,c,f,x.x,x.y)&&mt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;g&&g.z<=b;){if(g.x>=p&&g.x<=y&&g.y>=_&&g.y<=m&&g!==s&&g!==o&&Vs(a,h,l,u,c,f,g.x,g.y)&&mt(g.prev,g,g.next)>=0)return!1;g=g.nextZ}return!0}function Bf(i,e){let t=i;do{let n=t.prev,s=t.next.next;!ls(n,s)&&Tu(n,t,t.next,s)&&fr(n,s)&&fr(s,n)&&(e.push(n.i,t.i,s.i),pr(t),pr(t.next),t=i=s),t=t.next}while(t!==i);return wi(t)}function zf(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Zf(o,a)){let l=Au(o,a);o=wi(o,o.next),l=wi(l,l.next),dr(o,e,t,n,s,r,0),dr(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function kf(i,e,t,n){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=Eu(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Yf(c))}s.sort(Hf);for(let r=0;r<s.length;r++)t=Vf(s[r],t);return t}function Hf(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Vf(i,e){let t=Gf(i,e);if(!t)return e;let n=Au(t,i);return wi(n,n.next),wi(t,t.next)}function Gf(i,e){let t=e,n=i.x,s=i.y,r=-1/0,o;if(ls(i,t))return t;do{if(ls(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&wu(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let u=Math.abs(s-t.y)/(n-t.x);fr(t,i)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Wf(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function Wf(i,e){return mt(i.prev,i,e.prev)<0&&mt(e.next,i,i.next)<0}function Xf(i,e,t,n){let s=i;do s.z===0&&(s.z=Vl(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,qf(s)}function qf(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function Vl(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Yf(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function wu(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function Vs(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&wu(i,e,t,n,s,r,o,a)}function Zf(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Jf(i,e)&&(fr(i,e)&&fr(e,i)&&$f(i,e)&&(mt(i.prev,i,e.prev)||mt(i,e.prev,e))||ls(i,e)&&mt(i.prev,i,i.next)>0&&mt(e.prev,e,e.next)>0)}function mt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function ls(i,e){return i.x===e.x&&i.y===e.y}function Tu(i,e,t,n){let s=co(mt(i,e,t)),r=co(mt(i,e,n)),o=co(mt(t,n,i)),a=co(mt(t,n,e));return!!(s!==r&&o!==a||s===0&&lo(i,t,e)||r===0&&lo(i,n,e)||o===0&&lo(t,i,n)||a===0&&lo(t,e,n))}function lo(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function co(i){return i>0?1:i<0?-1:0}function Jf(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Tu(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function fr(i,e){return mt(i.prev,i,i.next)<0?mt(i,e,i.next)>=0&&mt(i,i.prev,e)>=0:mt(i,e,i.prev)<0||mt(i,i.next,e)<0}function $f(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Au(i,e){let t=Gl(i.i,i.x,i.y),n=Gl(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Ch(i,e,t,n){let s=Gl(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function pr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Gl(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Kf(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Wl=class{static triangulate(e,t,n=2){return Nf(e,t,n)}},vi=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Ih(e),Ph(n,e);let o=e.length;t.forEach(Ih);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Ph(n,t[l]);let a=Wl.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Ih(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Ph(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var mr=class i extends it{constructor(e=new as([new _e(.5,.5),new _e(-.5,.5),new _e(-.5,-.5),new _e(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new at(s,3)),this.setAttribute("uv",new at(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,_=t.bevelSize!==void 0?t.bevelSize:p-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,d=t.extrudePath,b=t.UVGenerator!==void 0?t.UVGenerator:jf,x,g=!1,R,T,w,P;d&&(x=d.getSpacedPoints(h),g=!0,f=!1,R=d.computeFrenetFrames(h,!1),T=new U,w=new U,P=new U),f||(m=0,p=0,_=0,y=0);let S=a.extractPoints(c),v=S.shape,E=S.holes;if(!vi.isClockWise(v)){v=v.reverse();for(let ce=0,ae=E.length;ce<ae;ce++){let ne=E[ce];vi.isClockWise(ne)&&(E[ce]=ne.reverse())}}function B(ce){let ne=10000000000000001e-36,se=ce[0];for(let xe=1;xe<=ce.length;xe++){let he=xe%ce.length,ye=ce[he],Ge=ye.x-se.x,Be=ye.y-se.y,D=Ge*Ge+Be*Be,M=Math.max(Math.abs(ye.x),Math.abs(ye.y),Math.abs(se.x),Math.abs(se.y)),I=ne*M*M;if(D<=I){ce.splice(he,1),xe--;continue}se=ye}}B(v),E.forEach(B);let q=E.length,z=v;for(let ce=0;ce<q;ce++){let ae=E[ce];v=v.concat(ae)}function V(ce,ae,ne){return ae||console.error("THREE.ExtrudeGeometry: vec does not exist"),ce.clone().addScaledVector(ae,ne)}let $=v.length;function G(ce,ae,ne){let se,xe,he,ye=ce.x-ae.x,Ge=ce.y-ae.y,Be=ne.x-ce.x,D=ne.y-ce.y,M=ye*ye+Ge*Ge,I=ye*D-Ge*Be;if(Math.abs(I)>Number.EPSILON){let O=Math.sqrt(M),H=Math.sqrt(Be*Be+D*D),k=ae.x-Ge/O,J=ae.y+ye/O,ee=ne.x-D/H,de=ne.y+Be/H,pe=((ee-k)*D-(de-J)*Be)/(ye*D-Ge*Be);se=k+ye*pe-ce.x,xe=J+Ge*pe-ce.y;let C=se*se+xe*xe;if(C<=2)return new _e(se,xe);he=Math.sqrt(C/2)}else{let O=!1;ye>Number.EPSILON?Be>Number.EPSILON&&(O=!0):ye<-Number.EPSILON?Be<-Number.EPSILON&&(O=!0):Math.sign(Ge)===Math.sign(D)&&(O=!0),O?(se=-Ge,xe=ye,he=Math.sqrt(M)):(se=ye,xe=Ge,he=Math.sqrt(M/2))}return new _e(se/he,xe/he)}let ue=[];for(let ce=0,ae=z.length,ne=ae-1,se=ce+1;ce<ae;ce++,ne++,se++)ne===ae&&(ne=0),se===ae&&(se=0),ue[ce]=G(z[ce],z[ne],z[se]);let me=[],Se,Me=ue.concat();for(let ce=0,ae=q;ce<ae;ce++){let ne=E[ce];Se=[];for(let se=0,xe=ne.length,he=xe-1,ye=se+1;se<xe;se++,he++,ye++)he===xe&&(he=0),ye===xe&&(ye=0),Se[se]=G(ne[se],ne[he],ne[ye]);me.push(Se),Me=Me.concat(Se)}let Fe;if(m===0)Fe=vi.triangulateShape(z,E);else{let ce=[],ae=[];for(let ne=0;ne<m;ne++){let se=ne/m,xe=p*Math.cos(se*Math.PI/2),he=_*Math.sin(se*Math.PI/2)+y;for(let ye=0,Ge=z.length;ye<Ge;ye++){let Be=V(z[ye],ue[ye],he);Le(Be.x,Be.y,-xe),se===0&&ce.push(Be)}for(let ye=0,Ge=q;ye<Ge;ye++){let Be=E[ye];Se=me[ye];let D=[];for(let M=0,I=Be.length;M<I;M++){let O=V(Be[M],Se[M],he);Le(O.x,O.y,-xe),se===0&&D.push(O)}se===0&&ae.push(D)}}Fe=vi.triangulateShape(ce,ae)}let Ze=Fe.length,Ye=_+y;for(let ce=0;ce<$;ce++){let ae=f?V(v[ce],Me[ce],Ye):v[ce];g?(w.copy(R.normals[0]).multiplyScalar(ae.x),T.copy(R.binormals[0]).multiplyScalar(ae.y),P.copy(x[0]).add(w).add(T),Le(P.x,P.y,P.z)):Le(ae.x,ae.y,0)}for(let ce=1;ce<=h;ce++)for(let ae=0;ae<$;ae++){let ne=f?V(v[ae],Me[ae],Ye):v[ae];g?(w.copy(R.normals[ce]).multiplyScalar(ne.x),T.copy(R.binormals[ce]).multiplyScalar(ne.y),P.copy(x[ce]).add(w).add(T),Le(P.x,P.y,P.z)):Le(ne.x,ne.y,u/h*ce)}for(let ce=m-1;ce>=0;ce--){let ae=ce/m,ne=p*Math.cos(ae*Math.PI/2),se=_*Math.sin(ae*Math.PI/2)+y;for(let xe=0,he=z.length;xe<he;xe++){let ye=V(z[xe],ue[xe],se);Le(ye.x,ye.y,u+ne)}for(let xe=0,he=E.length;xe<he;xe++){let ye=E[xe];Se=me[xe];for(let Ge=0,Be=ye.length;Ge<Be;Ge++){let D=V(ye[Ge],Se[Ge],se);g?Le(D.x,D.y+x[h-1].y,x[h-1].x+ne):Le(D.x,D.y,u+ne)}}}ie(),oe();function ie(){let ce=s.length/3;if(f){let ae=0,ne=$*ae;for(let se=0;se<Ze;se++){let xe=Fe[se];Pe(xe[2]+ne,xe[1]+ne,xe[0]+ne)}ae=h+m*2,ne=$*ae;for(let se=0;se<Ze;se++){let xe=Fe[se];Pe(xe[0]+ne,xe[1]+ne,xe[2]+ne)}}else{for(let ae=0;ae<Ze;ae++){let ne=Fe[ae];Pe(ne[2],ne[1],ne[0])}for(let ae=0;ae<Ze;ae++){let ne=Fe[ae];Pe(ne[0]+$*h,ne[1]+$*h,ne[2]+$*h)}}n.addGroup(ce,s.length/3-ce,0)}function oe(){let ce=s.length/3,ae=0;Ce(z,ae),ae+=z.length;for(let ne=0,se=E.length;ne<se;ne++){let xe=E[ne];Ce(xe,ae),ae+=xe.length}n.addGroup(ce,s.length/3-ce,1)}function Ce(ce,ae){let ne=ce.length;for(;--ne>=0;){let se=ne,xe=ne-1;xe<0&&(xe=ce.length-1);for(let he=0,ye=h+m*2;he<ye;he++){let Ge=$*he,Be=$*(he+1),D=ae+se+Ge,M=ae+xe+Ge,I=ae+xe+Be,O=ae+se+Be;Xe(D,M,I,O)}}}function Le(ce,ae,ne){l.push(ce),l.push(ae),l.push(ne)}function Pe(ce,ae,ne){et(ce),et(ae),et(ne);let se=s.length/3,xe=b.generateTopUV(n,s,se-3,se-2,se-1);N(xe[0]),N(xe[1]),N(xe[2])}function Xe(ce,ae,ne,se){et(ce),et(ae),et(se),et(ae),et(ne),et(se);let xe=s.length/3,he=b.generateSideWallUV(n,s,xe-6,xe-3,xe-2,xe-1);N(he[0]),N(he[1]),N(he[3]),N(he[1]),N(he[2]),N(he[3])}function et(ce){s.push(l[ce*3+0]),s.push(l[ce*3+1]),s.push(l[ce*3+2])}function N(ce){r.push(ce.x),r.push(ce.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Qf(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Po[s.type]().fromJSON(s)),new i(n,e.options)}},jf={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new _e(r,o),new _e(a,l),new _e(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],u=e[n*3+2],f=e[s*3],p=e[s*3+1],_=e[s*3+2],y=e[r*3],m=e[r*3+1],d=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new _e(o,1-l),new _e(c,1-u),new _e(f,1-_),new _e(y,1-d)]:[new _e(a,1-l),new _e(h,1-u),new _e(p,1-_),new _e(m,1-d)]}};function Qf(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var gr=class i extends it{constructor(e=[new _e(0,-.5),new _e(.5,0),new _e(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=je(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/t,u=new U,f=new _e,p=new U,_=new U,y=new U,m=0,d=0;for(let b=0;b<=e.length-1;b++)switch(b){case 0:m=e[b+1].x-e[b].x,d=e[b+1].y-e[b].y,p.x=d*1,p.y=-m,p.z=d*0,y.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:m=e[b+1].x-e[b].x,d=e[b+1].y-e[b].y,p.x=d*1,p.y=-m,p.z=d*0,_.copy(p),p.x+=y.x,p.y+=y.y,p.z+=y.z,p.normalize(),l.push(p.x,p.y,p.z),y.copy(_)}for(let b=0;b<=t;b++){let x=n+b*h*s,g=Math.sin(x),R=Math.cos(x);for(let T=0;T<=e.length-1;T++){u.x=e[T].x*g,u.y=e[T].y,u.z=e[T].x*R,o.push(u.x,u.y,u.z),f.x=b/t,f.y=T/(e.length-1),a.push(f.x,f.y);let w=l[3*T+0]*g,P=l[3*T+1],S=l[3*T+0]*R;c.push(w,P,S)}}for(let b=0;b<t;b++)for(let x=0;x<e.length-1;x++){let g=x+b*e.length,R=g,T=g+e.length,w=g+e.length+1,P=g+1;r.push(R,T,P),r.push(w,P,T)}this.setIndex(r),this.setAttribute("position",new at(o,3)),this.setAttribute("uv",new at(a,2)),this.setAttribute("normal",new at(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var Ti=class i extends it{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,f=t/l,p=[],_=[],y=[],m=[];for(let d=0;d<h;d++){let b=d*f-o;for(let x=0;x<c;x++){let g=x*u-r;_.push(g,-b,0),y.push(0,0,1),m.push(x/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let b=0;b<a;b++){let x=b+c*d,g=b+c*(d+1),R=b+1+c*(d+1),T=b+1+c*d;p.push(x,g,T),p.push(g,R,T)}this.setIndex(p),this.setAttribute("position",new at(_,3)),this.setAttribute("normal",new at(y,3)),this.setAttribute("uv",new at(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var It=class i extends it{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new U,f=new U,p=[],_=[],y=[],m=[];for(let d=0;d<=n;d++){let b=[],x=d/n,g=0;d===0&&o===0?g=.5/t:d===n&&l===Math.PI&&(g=-.5/t);for(let R=0;R<=t;R++){let T=R/t;u.x=-e*Math.cos(s+T*r)*Math.sin(o+x*a),u.y=e*Math.cos(o+x*a),u.z=e*Math.sin(s+T*r)*Math.sin(o+x*a),_.push(u.x,u.y,u.z),f.copy(u).normalize(),y.push(f.x,f.y,f.z),m.push(T+g,1-x),b.push(c++)}h.push(b)}for(let d=0;d<n;d++)for(let b=0;b<t;b++){let x=h[d][b+1],g=h[d][b],R=h[d+1][b],T=h[d+1][b+1];(d!==0||o>0)&&p.push(x,g,T),(d!==n-1||l<Math.PI)&&p.push(g,R,T)}this.setIndex(p),this.setAttribute("position",new at(_,3)),this.setAttribute("normal",new at(y,3)),this.setAttribute("uv",new at(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Tn=class i extends it{constructor(e=new cr(new U(-1,-1,0),new U(-1,1,0),new U(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new U,l=new U,c=new _e,h=new U,u=[],f=[],p=[],_=[];y(),this.setIndex(_),this.setAttribute("position",new at(u,3)),this.setAttribute("normal",new at(f,3)),this.setAttribute("uv",new at(p,2));function y(){for(let x=0;x<t;x++)m(x);m(r===!1?t:0),b(),d()}function m(x){h=e.getPointAt(x/t,h);let g=o.normals[x],R=o.binormals[x];for(let T=0;T<=s;T++){let w=T/s*Math.PI*2,P=Math.sin(w),S=-Math.cos(w);l.x=S*g.x+P*R.x,l.y=S*g.y+P*R.y,l.z=S*g.z+P*R.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let x=1;x<=t;x++)for(let g=1;g<=s;g++){let R=(s+1)*(x-1)+(g-1),T=(s+1)*x+(g-1),w=(s+1)*x+g,P=(s+1)*(x-1)+g;_.push(R,T,P),_.push(T,w,P)}}function b(){for(let x=0;x<=t;x++)for(let g=0;g<=s;g++)c.x=x/t,c.y=g/s,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Po[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Bt=class extends wn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new He(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=za,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var _r=class extends wn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new He(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new He(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=za,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new un,this.combine=Qo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},si=class extends wn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=uu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Lo=class extends wn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ho(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function ep(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Ai=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Uo=class extends Ai{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ol,endingEnd:Ol}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Bl:r=e,a=2*t-n;break;case zl:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Bl:o=e,l=2*n-t;break;case zl:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,p=this._weightNext,_=(n-t)/(s-t),y=_*_,m=y*_,d=-f*m+2*f*y-f*_,b=(1+f)*m+(-1.5-2*f)*y+(-.5+f)*_+1,x=(-1-p)*m+(1.5+p)*y+.5*_,g=p*m-p*y;for(let R=0;R!==a;++R)r[R]=d*o[h+R]+b*o[c+R]+x*o[l+R]+g*o[u+R];return r}},No=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(s-t),u=1-h;for(let f=0;f!==a;++f)r[f]=o[c+f]*u+o[l+f]*h;return r}},Fo=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},nn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ho(t,this.TimeBufferType),this.values=ho(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ho(e.times,Array),values:ho(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Fo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new No(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Uo(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Xs:t=this.InterpolantFactoryMethodDiscrete;break;case xo:t=this.InterpolantFactoryMethodLinear;break;case fo:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Xs;case this.InterpolantFactoryMethodLinear:return xo;case this.InterpolantFactoryMethodSmooth:return fo}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&ep(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===fo,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,f=u-n,p=u+n;for(let _=0;_!==n;++_){let y=t[u+_];if(y!==t[f+_]||y!==t[p+_]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,f=o*n;for(let p=0;p!==n;++p)t[f+p]=t[u+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};nn.prototype.ValueTypeName="";nn.prototype.TimeBufferType=Float32Array;nn.prototype.ValueBufferType=Float32Array;nn.prototype.DefaultInterpolation=xo;var ri=class extends nn{constructor(e,t,n){super(e,t,n)}};ri.prototype.ValueTypeName="bool";ri.prototype.ValueBufferType=Array;ri.prototype.DefaultInterpolation=Xs;ri.prototype.InterpolantFactoryMethodLinear=void 0;ri.prototype.InterpolantFactoryMethodSmooth=void 0;var Oo=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}};Oo.prototype.ValueTypeName="color";var Bo=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}};Bo.prototype.ValueTypeName="number";var zo=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)Ct.slerpFlat(r,0,o,c-a,o,c,l);return r}},xr=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new zo(this.times,this.values,this.getValueSize(),e)}};xr.prototype.ValueTypeName="quaternion";xr.prototype.InterpolantFactoryMethodSmooth=void 0;var oi=class extends nn{constructor(e,t,n){super(e,t,n)}};oi.prototype.ValueTypeName="string";oi.prototype.ValueBufferType=Array;oi.prototype.DefaultInterpolation=Xs;oi.prototype.InterpolantFactoryMethodLinear=void 0;oi.prototype.InterpolantFactoryMethodSmooth=void 0;var ko=class extends nn{constructor(e,t,n,s){super(e,t,n,s)}};ko.prototype.ValueTypeName="vector";var Ho=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let p=c[u],_=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Ru=new Ho,Vo=class{constructor(e){this.manager=e!==void 0?e:Ru,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Vo.DEFAULT_MATERIAL_NAME="__DEFAULT";var cs=class extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new He(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},yr=class extends cs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new He(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Ul=new Qe,Dh=new U,Lh=new U,Go=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new _e(512,512),this.mapType=Sn,this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rs,this._frameExtents=new _e(1,1),this._viewportCount=1,this._viewports=[new rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Dh.setFromMatrixPosition(e.matrixWorld),t.position.copy(Dh),Lh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Lh),t.updateMatrixWorld(),Ul.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ul,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ul)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Uh=new Qe,Hs=new U,Nl=new U,Xl=class extends Go{constructor(){super(new Rt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new _e(4,2),this._viewportCount=6,this._viewports=[new rt(2,1,1,1),new rt(0,1,1,1),new rt(3,1,1,1),new rt(1,1,1,1),new rt(3,0,1,1),new rt(1,0,1,1)],this._cubeDirections=[new U(1,0,0),new U(-1,0,0),new U(0,0,1),new U(0,0,-1),new U(0,1,0),new U(0,-1,0)],this._cubeUps=[new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,1,0),new U(0,0,1),new U(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Hs.setFromMatrixPosition(e.matrixWorld),n.position.copy(Hs),Nl.copy(n.position),Nl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Nl),n.updateMatrixWorld(),s.makeTranslation(-Hs.x,-Hs.y,-Hs.z),Uh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uh,n.coordinateSystem,n.reversedDepth)}},vr=class extends cs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Xl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Bn=class extends js{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ql=class extends Go{constructor(){super(new Bn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Mr=class extends cs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new ql}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Wo=class extends Rt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var uc="\\[\\]\\.:\\/",tp=new RegExp("["+uc+"]","g"),dc="[^"+uc+"]",np="[^"+uc.replace("\\.","")+"]",ip=/((?:WC+[\/:])*)/.source.replace("WC",dc),sp=/(WCOD+)?/.source.replace("WCOD",np),rp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",dc),op=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",dc),ap=new RegExp("^"+ip+sp+rp+op+"$"),lp=["material","materials","bones","map"],Yl=class{constructor(e,t,n){let s=n||dt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(tp,"")}static parseTrackName(e){let t=ap.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);lp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=Yl;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Zx=new Float32Array(1);var Nh=new U,uo,Fl,Sr=class extends vt{constructor(e=new U(0,0,1),t=new U(0,0,0),n=1,s=16776960,r=n*.2,o=r*.2){super(),this.type="ArrowHelper",uo===void 0&&(uo=new it,uo.setAttribute("position",new at([0,0,0,0,1,0],3)),Fl=new Ao(.5,1,5,1),Fl.translate(0,-.5,0)),this.position.copy(t),this.line=new Ei(uo,new On({color:s,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Ke(Fl,new en({color:s,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Nh.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Nh,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}};function fc(i,e,t,n){let s=cp(n);switch(t){case ic:return i*e;case aa:return i*e/s.components*s.byteLength;case la:return i*e/s.components*s.byteLength;case rc:return i*e*2/s.components*s.byteLength;case ca:return i*e*2/s.components*s.byteLength;case sc:return i*e*3/s.components*s.byteLength;case Xt:return i*e*4/s.components*s.byteLength;case ha:return i*e*4/s.components*s.byteLength;case Tr:case Ar:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Rr:case Cr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case da:case pa:return Math.max(i,16)*Math.max(e,8)/4;case ua:case fa:return Math.max(i,8)*Math.max(e,8)/2;case ma:case ga:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case _a:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case xa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ya:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case va:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Ma:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ba:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ea:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case wa:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Aa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ca:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ia:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Pa:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Da:case La:case Ua:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Na:case Fa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Oa:case Ba:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function cp(i){switch(i){case Sn:case Ql:return{byteLength:1,components:1};case hs:case ec:case us:return{byteLength:2,components:1};case ra:case oa:return{byteLength:2,components:4};case li:case sa:case sn:return{byteLength:4,components:1};case tc:case nc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function ju(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function up(i){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,_)=>p.start-_.start);let f=0;for(let p=1;p<u.length;p++){let _=u[f],y=u[p];y.start<=_.start+_.count+1?_.count=Math.max(_.count,y.start+y.count-_.start):(++f,u[f]=y)}u.length=f+1;for(let p=0,_=u.length;p<_;p++){let y=u[p];i.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var dp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,fp=`#ifdef USE_ALPHAHASH
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
#endif`,pp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_p=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xp=`#ifdef USE_AOMAP
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
#endif`,yp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,vp=`#ifdef USE_BATCHING
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
#endif`,Mp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Sp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ep=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,wp=`#ifdef USE_IRIDESCENCE
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
#endif`,Tp=`#ifdef USE_BUMPMAP
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
#endif`,Ap=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Pp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Dp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Lp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Up=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Np=`#define PI 3.141592653589793
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
} // validated`,Fp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Op=`vec3 transformedNormal = objectNormal;
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
#endif`,Bp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,zp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,kp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Gp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Wp=`#ifdef USE_ENVMAP
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
#endif`,Xp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,qp=`#ifdef USE_ENVMAP
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
#endif`,Yp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
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
#endif`,Jp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,$p=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Kp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,jp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Qp=`#ifdef USE_GRADIENTMAP
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
}`,em=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,tm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,nm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,im=`uniform bool receiveShadow;
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
#endif`,sm=`#ifdef USE_ENVMAP
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
#endif`,rm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,om=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,am=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,cm=`PhysicalMaterial material;
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
#endif`,hm=`struct PhysicalMaterial {
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
}`,um=`
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
#endif`,dm=`#if defined( RE_IndirectDiffuse )
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
#endif`,fm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,pm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,mm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_m=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,xm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ym=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,vm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Mm=`#if defined( USE_POINTS_UV )
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
#endif`,Sm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Em=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Tm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Am=`#ifdef USE_MORPHTARGETS
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
#endif`,Rm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Im=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Pm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Lm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Um=`#ifdef USE_NORMALMAP
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
#endif`,Nm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Fm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Om=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Bm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,zm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,km=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Hm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Gm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Wm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Xm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ym=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Zm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Jm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,$m=`float getShadowMask() {
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
}`,Km=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,jm=`#ifdef USE_SKINNING
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
#endif`,Qm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,eg=`#ifdef USE_SKINNING
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
#endif`,tg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ng=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ig=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,rg=`#ifdef USE_TRANSMISSION
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
#endif`,og=`#ifdef USE_TRANSMISSION
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
#endif`,ag=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,lg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ug=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,dg=`uniform sampler2D t2D;
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
}`,fg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,mg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_g=`#include <common>
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
}`,xg=`#if DEPTH_PACKING == 3200
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
}`,yg=`#define DISTANCE
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
}`,vg=`#define DISTANCE
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
}`,Mg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Sg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bg=`uniform float scale;
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
}`,Eg=`uniform vec3 diffuse;
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
}`,wg=`#include <common>
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
}`,Tg=`uniform vec3 diffuse;
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
}`,Ag=`#define LAMBERT
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
}`,Rg=`#define LAMBERT
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
}`,Cg=`#define MATCAP
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
}`,Ig=`#define MATCAP
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
}`,Pg=`#define NORMAL
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
}`,Dg=`#define NORMAL
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
}`,Lg=`#define PHONG
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
}`,Ug=`#define PHONG
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
}`,Ng=`#define STANDARD
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
}`,Fg=`#define STANDARD
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
}`,Og=`#define TOON
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
}`,Bg=`#define TOON
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
}`,zg=`uniform float size;
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
}`,kg=`uniform vec3 diffuse;
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
}`,Hg=`#include <common>
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
}`,Vg=`uniform vec3 color;
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
}`,Gg=`uniform float rotation;
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
}`,Wg=`uniform vec3 diffuse;
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
}`,$e={alphahash_fragment:dp,alphahash_pars_fragment:fp,alphamap_fragment:pp,alphamap_pars_fragment:mp,alphatest_fragment:gp,alphatest_pars_fragment:_p,aomap_fragment:xp,aomap_pars_fragment:yp,batching_pars_vertex:vp,batching_vertex:Mp,begin_vertex:Sp,beginnormal_vertex:bp,bsdfs:Ep,iridescence_fragment:wp,bumpmap_pars_fragment:Tp,clipping_planes_fragment:Ap,clipping_planes_pars_fragment:Rp,clipping_planes_pars_vertex:Cp,clipping_planes_vertex:Ip,color_fragment:Pp,color_pars_fragment:Dp,color_pars_vertex:Lp,color_vertex:Up,common:Np,cube_uv_reflection_fragment:Fp,defaultnormal_vertex:Op,displacementmap_pars_vertex:Bp,displacementmap_vertex:zp,emissivemap_fragment:kp,emissivemap_pars_fragment:Hp,colorspace_fragment:Vp,colorspace_pars_fragment:Gp,envmap_fragment:Wp,envmap_common_pars_fragment:Xp,envmap_pars_fragment:qp,envmap_pars_vertex:Yp,envmap_physical_pars_fragment:sm,envmap_vertex:Zp,fog_vertex:Jp,fog_pars_vertex:$p,fog_fragment:Kp,fog_pars_fragment:jp,gradientmap_pars_fragment:Qp,lightmap_pars_fragment:em,lights_lambert_fragment:tm,lights_lambert_pars_fragment:nm,lights_pars_begin:im,lights_toon_fragment:rm,lights_toon_pars_fragment:om,lights_phong_fragment:am,lights_phong_pars_fragment:lm,lights_physical_fragment:cm,lights_physical_pars_fragment:hm,lights_fragment_begin:um,lights_fragment_maps:dm,lights_fragment_end:fm,logdepthbuf_fragment:pm,logdepthbuf_pars_fragment:mm,logdepthbuf_pars_vertex:gm,logdepthbuf_vertex:_m,map_fragment:xm,map_pars_fragment:ym,map_particle_fragment:vm,map_particle_pars_fragment:Mm,metalnessmap_fragment:Sm,metalnessmap_pars_fragment:bm,morphinstance_vertex:Em,morphcolor_vertex:wm,morphnormal_vertex:Tm,morphtarget_pars_vertex:Am,morphtarget_vertex:Rm,normal_fragment_begin:Cm,normal_fragment_maps:Im,normal_pars_fragment:Pm,normal_pars_vertex:Dm,normal_vertex:Lm,normalmap_pars_fragment:Um,clearcoat_normal_fragment_begin:Nm,clearcoat_normal_fragment_maps:Fm,clearcoat_pars_fragment:Om,iridescence_pars_fragment:Bm,opaque_fragment:zm,packing:km,premultiplied_alpha_fragment:Hm,project_vertex:Vm,dithering_fragment:Gm,dithering_pars_fragment:Wm,roughnessmap_fragment:Xm,roughnessmap_pars_fragment:qm,shadowmap_pars_fragment:Ym,shadowmap_pars_vertex:Zm,shadowmap_vertex:Jm,shadowmask_pars_fragment:$m,skinbase_vertex:Km,skinning_pars_vertex:jm,skinning_vertex:Qm,skinnormal_vertex:eg,specularmap_fragment:tg,specularmap_pars_fragment:ng,tonemapping_fragment:ig,tonemapping_pars_fragment:sg,transmission_fragment:rg,transmission_pars_fragment:og,uv_pars_fragment:ag,uv_pars_vertex:lg,uv_vertex:cg,worldpos_vertex:hg,background_vert:ug,background_frag:dg,backgroundCube_vert:fg,backgroundCube_frag:pg,cube_vert:mg,cube_frag:gg,depth_vert:_g,depth_frag:xg,distanceRGBA_vert:yg,distanceRGBA_frag:vg,equirect_vert:Mg,equirect_frag:Sg,linedashed_vert:bg,linedashed_frag:Eg,meshbasic_vert:wg,meshbasic_frag:Tg,meshlambert_vert:Ag,meshlambert_frag:Rg,meshmatcap_vert:Cg,meshmatcap_frag:Ig,meshnormal_vert:Pg,meshnormal_frag:Dg,meshphong_vert:Lg,meshphong_frag:Ug,meshphysical_vert:Ng,meshphysical_frag:Fg,meshtoon_vert:Og,meshtoon_frag:Bg,points_vert:zg,points_frag:kg,shadow_vert:Hg,shadow_frag:Vg,sprite_vert:Gg,sprite_frag:Wg},Te={common:{diffuse:{value:new He(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new qe},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new qe}},envmap:{envMap:{value:null},envMapRotation:{value:new qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new qe},normalScale:{value:new _e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new He(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new He(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0},uvTransform:{value:new qe}},sprite:{diffuse:{value:new He(16777215)},opacity:{value:1},center:{value:new _e(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new qe},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0}}},Rn={basic:{uniforms:Nt([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:Nt([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new He(0)}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:Nt([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new He(0)},specular:{value:new He(1118481)},shininess:{value:30}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:Nt([Te.common,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.roughnessmap,Te.metalnessmap,Te.fog,Te.lights,{emissive:{value:new He(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:Nt([Te.common,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.gradientmap,Te.fog,Te.lights,{emissive:{value:new He(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:Nt([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:Nt([Te.points,Te.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:Nt([Te.common,Te.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:Nt([Te.common,Te.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:Nt([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:Nt([Te.sprite,Te.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new qe}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distanceRGBA:{uniforms:Nt([Te.common,Te.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distanceRGBA_vert,fragmentShader:$e.distanceRGBA_frag},shadow:{uniforms:Nt([Te.lights,Te.fog,{color:{value:new He(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};Rn.physical={uniforms:Nt([Rn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new qe},clearcoatNormalScale:{value:new _e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new qe},sheen:{value:0},sheenColor:{value:new He(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new qe},transmissionSamplerSize:{value:new _e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new qe},attenuationDistance:{value:0},attenuationColor:{value:new He(0)},specularColor:{value:new He(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new qe},anisotropyVector:{value:new _e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new qe}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var ka={r:0,b:0,g:0},Pi=new un,Xg=new Qe;function qg(i,e,t,n,s,r,o){let a=new He(0),l=r===!0?0:1,c,h,u=null,f=0,p=null;function _(x){let g=x.isScene===!0?x.background:null;return g&&g.isTexture&&(g=(x.backgroundBlurriness>0?t:e).get(g)),g}function y(x){let g=!1,R=_(x);R===null?d(a,l):R&&R.isColor&&(d(R,1),g=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,o):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||g)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,g){let R=_(g);R&&(R.isCubeTexture||R.mapping===Er)?(h===void 0&&(h=new Ke(new dn(1,1,1),new vn({name:"BackgroundCubeMaterial",uniforms:Ii(Rn.backgroundCube.uniforms),vertexShader:Rn.backgroundCube.vertexShader,fragmentShader:Rn.backgroundCube.fragmentShader,side:Mt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(T,w,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Pi.copy(g.backgroundRotation),Pi.x*=-1,Pi.y*=-1,Pi.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(Pi.y*=-1,Pi.z*=-1),h.material.uniforms.envMap.value=R,h.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=g.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Xg.makeRotationFromEuler(Pi)),h.material.toneMapped=nt.getTransfer(R.colorSpace)!==lt,(u!==R||f!==R.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=R,f=R.version,p=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):R&&R.isTexture&&(c===void 0&&(c=new Ke(new Ti(2,2),new vn({name:"BackgroundMaterial",uniforms:Ii(Rn.background.uniforms),vertexShader:Rn.background.vertexShader,fragmentShader:Rn.background.fragmentShader,side:Vt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=R,c.material.uniforms.backgroundIntensity.value=g.backgroundIntensity,c.material.toneMapped=nt.getTransfer(R.colorSpace)!==lt,R.matrixAutoUpdate===!0&&R.updateMatrix(),c.material.uniforms.uvTransform.value.copy(R.matrix),(u!==R||f!==R.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=R,f=R.version,p=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function d(x,g){x.getRGB(ka,cc(i)),n.buffers.color.setClear(ka.r,ka.g,ka.b,g,o)}function b(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,g=1){a.set(x),l=g,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,d(a,l)},render:y,addToRenderList:m,dispose:b}}function Yg(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(v,E,L,B,q){let z=!1,V=u(B,L,E);r!==V&&(r=V,c(r.object)),z=p(v,B,L,q),z&&_(v,B,L,q),q!==null&&e.update(q,i.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,g(v,E,L,B),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return i.createVertexArray()}function c(v){return i.bindVertexArray(v)}function h(v){return i.deleteVertexArray(v)}function u(v,E,L){let B=L.wireframe===!0,q=n[v.id];q===void 0&&(q={},n[v.id]=q);let z=q[E.id];z===void 0&&(z={},q[E.id]=z);let V=z[B];return V===void 0&&(V=f(l()),z[B]=V),V}function f(v){let E=[],L=[],B=[];for(let q=0;q<t;q++)E[q]=0,L[q]=0,B[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:E,enabledAttributes:L,attributeDivisors:B,object:v,attributes:{},index:null}}function p(v,E,L,B){let q=r.attributes,z=E.attributes,V=0,$=L.getAttributes();for(let G in $)if($[G].location>=0){let me=q[G],Se=z[G];if(Se===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(Se=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(Se=v.instanceColor)),me===void 0||me.attribute!==Se||Se&&me.data!==Se.data)return!0;V++}return r.attributesNum!==V||r.index!==B}function _(v,E,L,B){let q={},z=E.attributes,V=0,$=L.getAttributes();for(let G in $)if($[G].location>=0){let me=z[G];me===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(me=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(me=v.instanceColor));let Se={};Se.attribute=me,me&&me.data&&(Se.data=me.data),q[G]=Se,V++}r.attributes=q,r.attributesNum=V,r.index=B}function y(){let v=r.newAttributes;for(let E=0,L=v.length;E<L;E++)v[E]=0}function m(v){d(v,0)}function d(v,E){let L=r.newAttributes,B=r.enabledAttributes,q=r.attributeDivisors;L[v]=1,B[v]===0&&(i.enableVertexAttribArray(v),B[v]=1),q[v]!==E&&(i.vertexAttribDivisor(v,E),q[v]=E)}function b(){let v=r.newAttributes,E=r.enabledAttributes;for(let L=0,B=E.length;L<B;L++)E[L]!==v[L]&&(i.disableVertexAttribArray(L),E[L]=0)}function x(v,E,L,B,q,z,V){V===!0?i.vertexAttribIPointer(v,E,L,q,z):i.vertexAttribPointer(v,E,L,B,q,z)}function g(v,E,L,B){y();let q=B.attributes,z=L.getAttributes(),V=E.defaultAttributeValues;for(let $ in z){let G=z[$];if(G.location>=0){let ue=q[$];if(ue===void 0&&($==="instanceMatrix"&&v.instanceMatrix&&(ue=v.instanceMatrix),$==="instanceColor"&&v.instanceColor&&(ue=v.instanceColor)),ue!==void 0){let me=ue.normalized,Se=ue.itemSize,Me=e.get(ue);if(Me===void 0)continue;let Fe=Me.buffer,Ze=Me.type,Ye=Me.bytesPerElement,ie=Ze===i.INT||Ze===i.UNSIGNED_INT||ue.gpuType===sa;if(ue.isInterleavedBufferAttribute){let oe=ue.data,Ce=oe.stride,Le=ue.offset;if(oe.isInstancedInterleavedBuffer){for(let Pe=0;Pe<G.locationSize;Pe++)d(G.location+Pe,oe.meshPerAttribute);v.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Pe=0;Pe<G.locationSize;Pe++)m(G.location+Pe);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let Pe=0;Pe<G.locationSize;Pe++)x(G.location+Pe,Se/G.locationSize,Ze,me,Ce*Ye,(Le+Se/G.locationSize*Pe)*Ye,ie)}else{if(ue.isInstancedBufferAttribute){for(let oe=0;oe<G.locationSize;oe++)d(G.location+oe,ue.meshPerAttribute);v.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ue.meshPerAttribute*ue.count)}else for(let oe=0;oe<G.locationSize;oe++)m(G.location+oe);i.bindBuffer(i.ARRAY_BUFFER,Fe);for(let oe=0;oe<G.locationSize;oe++)x(G.location+oe,Se/G.locationSize,Ze,me,Se*Ye,Se/G.locationSize*oe*Ye,ie)}}else if(V!==void 0){let me=V[$];if(me!==void 0)switch(me.length){case 2:i.vertexAttrib2fv(G.location,me);break;case 3:i.vertexAttrib3fv(G.location,me);break;case 4:i.vertexAttrib4fv(G.location,me);break;default:i.vertexAttrib1fv(G.location,me)}}}}b()}function R(){P();for(let v in n){let E=n[v];for(let L in E){let B=E[L];for(let q in B)h(B[q].object),delete B[q];delete E[L]}delete n[v]}}function T(v){if(n[v.id]===void 0)return;let E=n[v.id];for(let L in E){let B=E[L];for(let q in B)h(B[q].object),delete B[q];delete E[L]}delete n[v.id]}function w(v){for(let E in n){let L=n[E];if(L[v.id]===void 0)continue;let B=L[v.id];for(let q in B)h(B[q].object),delete B[q];delete L[v.id]}}function P(){S(),o=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:P,resetDefaultState:S,dispose:R,releaseStatesOfGeometry:T,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:m,disableUnusedAttributes:b}}function Zg(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let _=0;_<u;_++)p+=h[_];t.update(p,n,1)}function l(c,h,u,f){if(u===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<c.length;_++)o(c[_],h[_],f[_]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let _=0;for(let y=0;y<u;y++)_+=h[y]*f[y];t.update(_,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Jg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==Xt&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){let P=w===us&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Sn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==sn&&!P)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),x=i.getParameter(i.MAX_VARYING_VECTORS),g=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=_>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:_,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:b,maxVaryings:x,maxFragmentUniforms:g,vertexTextures:R,maxSamples:T}}function $g(i){let e=this,t=null,n=0,s=!1,r=!1,o=new En,a=new qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,p){let _=u.clippingPlanes,y=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||_===null||_.length===0||r&&!m)r?h(null):c();else{let b=r?0:n,x=b*4,g=d.clippingState||null;l.value=g,g=h(_,f,x,p);for(let R=0;R!==x;++R)g[R]=t[R];d.clippingState=g,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,p,_){let y=u!==null?u.length:0,m=null;if(y!==0){if(m=l.value,_!==!0||m===null){let d=p+y*4,b=f.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<d)&&(m=new Float32Array(d));for(let x=0,g=p;x!==y;++x,g+=4)o.copy(u[x]).applyMatrix4(b,a),o.normal.toArray(m,g),m[g+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function Kg(i){let e=new WeakMap;function t(o,a){return a===ta?o.mapping=Ri:a===na&&(o.mapping=Ci),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ta||a===na)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Eo(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var xs=4,Cu=[.125,.215,.35,.446,.526,.582],Ui=20,pc=new Bn,Iu=new He,mc=null,gc=0,_c=0,xc=!1,Li=(1+Math.sqrt(5))/2,_s=1/Li,Pu=[new U(-Li,_s,0),new U(Li,_s,0),new U(-_s,0,Li),new U(_s,0,Li),new U(0,Li,-_s),new U(0,Li,_s),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)],jg=new U,vs=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=jg}=r;mc=this._renderer.getRenderTarget(),gc=this._renderer.getActiveCubeFace(),_c=this._renderer.getActiveMipmapLevel(),xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Uu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Lu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(mc,gc,_c),this._renderer.xr.enabled=xc,e.scissorTest=!1,Ha(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ri||e.mapping===Ci?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),mc=this._renderer.getRenderTarget(),gc=this._renderer.getActiveCubeFace(),_c=this._renderer.getActiveMipmapLevel(),xc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Gt,minFilter:Gt,generateMipmaps:!1,type:us,format:Xt,colorSpace:bi,depthBuffer:!1},s=Du(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Du(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Qg(r)),this._blurMaterial=e0(r,e,t)}return s}_compileMaterial(e){let t=new Ke(this._lodPlanes[0],e);this._renderer.compile(t,pc)}_sceneToCubeUV(e,t,n,s,r){let l=new Rt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(Iu),u.toneMapping=kn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));let y=new en({name:"PMREM.Background",side:Mt,depthWrite:!1,depthTest:!1}),m=new Ke(new dn,y),d=!1,b=e.background;b?b.isColor&&(y.color.copy(b),e.background=null,d=!0):(y.color.copy(Iu),d=!0);for(let x=0;x<6;x++){let g=x%3;g===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[x],r.y,r.z)):g===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[x]));let R=this._cubeSize;Ha(s,g*R,x>2?R:0,R,R),u.setRenderTarget(s),d&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=f,e.background=b}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Ri||e.mapping===Ci;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Uu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Lu());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ke(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Ha(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,pc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Pu[(s-r-1)%Pu.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new Ke(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Ui-1),y=r/_,m=isFinite(r)?1+Math.floor(h*y):Ui;m>Ui&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ui}`);let d=[],b=0;for(let w=0;w<Ui;++w){let P=w/y,S=Math.exp(-P*P/2);d.push(S),w===0?b+=S:w<m&&(b+=2*S)}for(let w=0;w<d.length;w++)d[w]=d[w]/b;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:x}=this;f.dTheta.value=_,f.mipInt.value=x-n;let g=this._sizeLods[s],R=3*g*(s>x-xs?s-x+xs:0),T=4*(this._cubeSize-g);Ha(t,R,T,3*g,2*g),l.setRenderTarget(t),l.render(u,pc)}};function Qg(i){let e=[],t=[],n=[],s=i,r=i-xs+1+Cu.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-xs?l=Cu[o-i+xs-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,_=6,y=3,m=2,d=1,b=new Float32Array(y*_*p),x=new Float32Array(m*_*p),g=new Float32Array(d*_*p);for(let T=0;T<p;T++){let w=T%3*2/3-1,P=T>2?0:-1,S=[w,P,0,w+2/3,P,0,w+2/3,P+1,0,w,P,0,w+2/3,P+1,0,w,P+1,0];b.set(S,y*_*T),x.set(f,m*_*T);let v=[T,T,T,T,T,T];g.set(v,d*_*T)}let R=new it;R.setAttribute("position",new Ve(b,y)),R.setAttribute("uv",new Ve(x,m)),R.setAttribute("faceIndex",new Ve(g,d)),e.push(R),s>xs&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Du(i,e,t){let n=new hn(i,e,t);return n.texture.mapping=Er,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ha(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function e0(i,e,t){let n=new Float32Array(Ui),s=new U(0,1,0);return new vn({name:"SphericalGaussianBlur",defines:{n:Ui,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Rc(),fragmentShader:`

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
		`,blending:zn,depthTest:!1,depthWrite:!1})}function Lu(){return new vn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Rc(),fragmentShader:`

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
		`,blending:zn,depthTest:!1,depthWrite:!1})}function Uu(){return new vn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Rc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:zn,depthTest:!1,depthWrite:!1})}function Rc(){return`

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
	`}function t0(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===ta||l===na,h=l===Ri||l===Ci;if(c||h){let u=e.get(a),f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new vs(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let p=a.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new vs(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function n0(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&ns("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function i0(i,e,t,n){let s={},r=new WeakMap;function o(u){let f=u.target;f.index!==null&&e.remove(f.index);for(let _ in f.attributes)e.remove(f.attributes[_]);f.removeEventListener("dispose",o),delete s[f.id];let p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(u){let f=u.attributes;for(let p in f)e.update(f[p],i.ARRAY_BUFFER)}function c(u){let f=[],p=u.index,_=u.attributes.position,y=0;if(p!==null){let b=p.array;y=p.version;for(let x=0,g=b.length;x<g;x+=3){let R=b[x+0],T=b[x+1],w=b[x+2];f.push(R,T,T,w,w,R)}}else if(_!==void 0){let b=_.array;y=_.version;for(let x=0,g=b.length/3-1;x<g;x+=3){let R=x+0,T=x+1,w=x+2;f.push(R,T,T,w,w,R)}}else return;let m=new(lc(f)?ni:ti)(f,1);m.version=y;let d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){let f=r.get(u);if(f){let p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function s0(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*o),t.update(p,n,1)}function c(f,p,_){_!==0&&(i.drawElementsInstanced(n,p,r,f*o,_),t.update(p,n,_))}function h(f,p,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,_);let m=0;for(let d=0;d<_;d++)m+=p[d];t.update(m,n,1)}function u(f,p,_,y){if(_===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/o,p[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,y,0,_);let d=0;for(let b=0;b<_;b++)d+=p[b]*y[b];t.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function r0(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function o0(i,e,t){let n=new WeakMap,s=new rt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,f=n.get(a);if(f===void 0||f.count!==u){let S=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",S)};f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],x=0;p===!0&&(x=1),_===!0&&(x=2),y===!0&&(x=3);let g=a.attributes.position.count*x,R=1;g>e.maxTextureSize&&(R=Math.ceil(g/e.maxTextureSize),g=e.maxTextureSize);let T=new Float32Array(g*R*4*u),w=new Js(T,g,R,u);w.type=sn,w.needsUpdate=!0;let P=x*4;for(let v=0;v<u;v++){let E=m[v],L=d[v],B=b[v],q=g*R*4*v;for(let z=0;z<E.count;z++){let V=z*P;p===!0&&(s.fromBufferAttribute(E,z),T[q+V+0]=s.x,T[q+V+1]=s.y,T[q+V+2]=s.z,T[q+V+3]=0),_===!0&&(s.fromBufferAttribute(L,z),T[q+V+4]=s.x,T[q+V+5]=s.y,T[q+V+6]=s.z,T[q+V+7]=0),y===!0&&(s.fromBufferAttribute(B,z),T[q+V+8]=s.x,T[q+V+9]=s.y,T[q+V+10]=s.z,T[q+V+11]=B.itemSize===4?s.w:1)}}f={count:u,texture:w,size:new _e(g,R)},n.set(a,f),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];let _=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function a0(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var Qu=new Ot,Nu=new sr(1,1),ed=new Js,td=new So,nd=new Qs,Fu=[],Ou=[],Bu=new Float32Array(16),zu=new Float32Array(9),ku=new Float32Array(4);function Ms(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Fu[s];if(r===void 0&&(r=new Float32Array(s),Fu[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function bt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Et(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ga(i,e){let t=Ou[e];t===void 0&&(t=new Int32Array(e),Ou[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function l0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function c0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2fv(this.addr,e),Et(t,e)}}function h0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(bt(t,e))return;i.uniform3fv(this.addr,e),Et(t,e)}}function u0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4fv(this.addr,e),Et(t,e)}}function d0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Et(t,e)}else{if(bt(t,n))return;ku.set(n),i.uniformMatrix2fv(this.addr,!1,ku),Et(t,n)}}function f0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Et(t,e)}else{if(bt(t,n))return;zu.set(n),i.uniformMatrix3fv(this.addr,!1,zu),Et(t,n)}}function p0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(bt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Et(t,e)}else{if(bt(t,n))return;Bu.set(n),i.uniformMatrix4fv(this.addr,!1,Bu),Et(t,n)}}function m0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function g0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2iv(this.addr,e),Et(t,e)}}function _0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3iv(this.addr,e),Et(t,e)}}function x0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4iv(this.addr,e),Et(t,e)}}function y0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function v0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(bt(t,e))return;i.uniform2uiv(this.addr,e),Et(t,e)}}function M0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(bt(t,e))return;i.uniform3uiv(this.addr,e),Et(t,e)}}function S0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(bt(t,e))return;i.uniform4uiv(this.addr,e),Et(t,e)}}function b0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Nu.compareFunction=oc,r=Nu):r=Qu,t.setTexture2D(e||r,s)}function E0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||td,s)}function w0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||nd,s)}function T0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||ed,s)}function A0(i){switch(i){case 5126:return l0;case 35664:return c0;case 35665:return h0;case 35666:return u0;case 35674:return d0;case 35675:return f0;case 35676:return p0;case 5124:case 35670:return m0;case 35667:case 35671:return g0;case 35668:case 35672:return _0;case 35669:case 35673:return x0;case 5125:return y0;case 36294:return v0;case 36295:return M0;case 36296:return S0;case 35678:case 36198:case 36298:case 36306:case 35682:return b0;case 35679:case 36299:case 36307:return E0;case 35680:case 36300:case 36308:case 36293:return w0;case 36289:case 36303:case 36311:case 36292:return T0}}function R0(i,e){i.uniform1fv(this.addr,e)}function C0(i,e){let t=Ms(e,this.size,2);i.uniform2fv(this.addr,t)}function I0(i,e){let t=Ms(e,this.size,3);i.uniform3fv(this.addr,t)}function P0(i,e){let t=Ms(e,this.size,4);i.uniform4fv(this.addr,t)}function D0(i,e){let t=Ms(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function L0(i,e){let t=Ms(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function U0(i,e){let t=Ms(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function N0(i,e){i.uniform1iv(this.addr,e)}function F0(i,e){i.uniform2iv(this.addr,e)}function O0(i,e){i.uniform3iv(this.addr,e)}function B0(i,e){i.uniform4iv(this.addr,e)}function z0(i,e){i.uniform1uiv(this.addr,e)}function k0(i,e){i.uniform2uiv(this.addr,e)}function H0(i,e){i.uniform3uiv(this.addr,e)}function V0(i,e){i.uniform4uiv(this.addr,e)}function G0(i,e,t){let n=this.cache,s=e.length,r=Ga(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Qu,r[o])}function W0(i,e,t){let n=this.cache,s=e.length,r=Ga(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||td,r[o])}function X0(i,e,t){let n=this.cache,s=e.length,r=Ga(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||nd,r[o])}function q0(i,e,t){let n=this.cache,s=e.length,r=Ga(t,s);bt(n,r)||(i.uniform1iv(this.addr,r),Et(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||ed,r[o])}function Y0(i){switch(i){case 5126:return R0;case 35664:return C0;case 35665:return I0;case 35666:return P0;case 35674:return D0;case 35675:return L0;case 35676:return U0;case 5124:case 35670:return N0;case 35667:case 35671:return F0;case 35668:case 35672:return O0;case 35669:case 35673:return B0;case 5125:return z0;case 36294:return k0;case 36295:return H0;case 36296:return V0;case 35678:case 36198:case 36298:case 36306:case 35682:return G0;case 35679:case 36299:case 36307:return W0;case 35680:case 36300:case 36308:case 36293:return X0;case 36289:case 36303:case 36311:case 36292:return q0}}var vc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=A0(t.type)}},Mc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Y0(t.type)}},Sc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},yc=/(\w+)(\])?(\[|\.)?/g;function Hu(i,e){i.seq.push(e),i.map[e.id]=e}function Z0(i,e,t){let n=i.name,s=n.length;for(yc.lastIndex=0;;){let r=yc.exec(n),o=yc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Hu(t,c===void 0?new vc(a,i,e):new Mc(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Sc(a),Hu(t,u)),t=u}}}var ys=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Z0(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Vu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var J0=37297,$0=0;function K0(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Gu=new qe;function j0(i){nt._getMatrix(Gu,nt.workingColorSpace,i);let e=`mat3( ${Gu.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(i)){case qs:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Wu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+K0(i.getShaderSource(e),a)}else return r}function Q0(i,e){let t=j0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function e_(i,e){let t;switch(e){case su:t="Linear";break;case ru:t="Reinhard";break;case ou:t="Cineon";break;case au:t="ACESFilmic";break;case cu:t="AgX";break;case ea:t="Neutral";break;case lu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Va=new U;function t_(){nt.getLuminanceCoefficients(Va);let i=Va.x.toFixed(4),e=Va.y.toFixed(4),t=Va.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function n_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ir).join(`
`)}function i_(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function s_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Ir(i){return i!==""}function Xu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function qu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var r_=/^[ \t]*#include +<([\w\d./]+)>/gm;function bc(i){return i.replace(r_,a_)}var o_=new Map;function a_(i,e){let t=$e[e];if(t===void 0){let n=o_.get(e);if(n!==void 0)t=$e[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return bc(t)}var l_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Yu(i){return i.replace(l_,c_)}function c_(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Zu(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function h_(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===br?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Xo?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===An&&(e="SHADOWMAP_TYPE_VSM"),e}function u_(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ri:case Ci:e="ENVMAP_TYPE_CUBE";break;case Er:e="ENVMAP_TYPE_CUBE_UV";break}return e}function d_(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ci:e="ENVMAP_MODE_REFRACTION";break}return e}function f_(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Qo:e="ENVMAP_BLENDING_MULTIPLY";break;case nu:e="ENVMAP_BLENDING_MIX";break;case iu:e="ENVMAP_BLENDING_ADD";break}return e}function p_(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function m_(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=h_(t),c=u_(t),h=d_(t),u=f_(t),f=p_(t),p=n_(t),_=i_(r),y=s.createProgram(),m,d,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ir).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ir).join(`
`),d.length>0&&(d+=`
`)):(m=[Zu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ir).join(`
`),d=[Zu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kn?"#define TONE_MAPPING":"",t.toneMapping!==kn?$e.tonemapping_pars_fragment:"",t.toneMapping!==kn?e_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,Q0("linearToOutputTexel",t.outputColorSpace),t_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ir).join(`
`)),o=bc(o),o=Xu(o,t),o=qu(o,t),a=bc(a),a=Xu(a,t),a=qu(a,t),o=Yu(o),a=Yu(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===ac?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ac?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let x=b+m+o,g=b+d+a,R=Vu(s,s.VERTEX_SHADER,x),T=Vu(s,s.FRAGMENT_SHADER,g);s.attachShader(y,R),s.attachShader(y,T),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function w(E){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y)||"",B=s.getShaderInfoLog(R)||"",q=s.getShaderInfoLog(T)||"",z=L.trim(),V=B.trim(),$=q.trim(),G=!0,ue=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,R,T);else{let me=Wu(s,R,"vertex"),Se=Wu(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+E.name+`
Material Type: `+E.type+`

Program Info Log: `+z+`
`+me+`
`+Se)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(V===""||$==="")&&(ue=!1);ue&&(E.diagnostics={runnable:G,programLog:z,vertexShader:{log:V,prefix:m},fragmentShader:{log:$,prefix:d}})}s.deleteShader(R),s.deleteShader(T),P=new ys(s,y),S=s_(s,y)}let P;this.getUniforms=function(){return P===void 0&&w(this),P};let S;this.getAttributes=function(){return S===void 0&&w(this),S};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(y,J0)),v},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$0++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=R,this.fragmentShader=T,this}var g_=0,Ec=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new wc(e),t.set(e,n)),n}},wc=class{constructor(e){this.id=g_++,this.code=e,this.usedTimes=0}};function __(i,e,t,n,s,r,o){let a=new Ks,l=new Ec,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,v,E,L,B){let q=L.fog,z=B.geometry,V=S.isMeshStandardMaterial?L.environment:null,$=(S.isMeshStandardMaterial?t:e).get(S.envMap||V),G=$&&$.mapping===Er?$.image.height:null,ue=_[S.type];S.precision!==null&&(p=s.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));let me=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Se=me!==void 0?me.length:0,Me=0;z.morphAttributes.position!==void 0&&(Me=1),z.morphAttributes.normal!==void 0&&(Me=2),z.morphAttributes.color!==void 0&&(Me=3);let Fe,Ze,Ye,ie;if(ue){let be=Rn[ue];Fe=be.vertexShader,Ze=be.fragmentShader}else Fe=S.vertexShader,Ze=S.fragmentShader,l.update(S),Ye=l.getVertexShaderID(S),ie=l.getFragmentShaderID(S);let oe=i.getRenderTarget(),Ce=i.state.buffers.depth.getReversed(),Le=B.isInstancedMesh===!0,Pe=B.isBatchedMesh===!0,Xe=!!S.map,et=!!S.matcap,N=!!$,ce=!!S.aoMap,ae=!!S.lightMap,ne=!!S.bumpMap,se=!!S.normalMap,xe=!!S.displacementMap,he=!!S.emissiveMap,ye=!!S.metalnessMap,Ge=!!S.roughnessMap,Be=S.anisotropy>0,D=S.clearcoat>0,M=S.dispersion>0,I=S.iridescence>0,O=S.sheen>0,H=S.transmission>0,k=Be&&!!S.anisotropyMap,J=D&&!!S.clearcoatMap,ee=D&&!!S.clearcoatNormalMap,de=D&&!!S.clearcoatRoughnessMap,pe=I&&!!S.iridescenceMap,C=I&&!!S.iridescenceThicknessMap,Z=O&&!!S.sheenColorMap,j=O&&!!S.sheenRoughnessMap,Y=!!S.specularMap,te=!!S.specularColorMap,Ee=!!S.specularIntensityMap,F=H&&!!S.transmissionMap,re=H&&!!S.thicknessMap,ve=!!S.gradientMap,Ae=!!S.alphaMap,fe=S.alphaTest>0,le=!!S.alphaHash,Ie=!!S.extensions,ze=kn;S.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(ze=i.toneMapping);let we={shaderID:ue,shaderType:S.type,shaderName:S.name,vertexShader:Fe,fragmentShader:Ze,defines:S.defines,customVertexShaderID:Ye,customFragmentShaderID:ie,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:Pe,batchingColor:Pe&&B._colorsTexture!==null,instancing:Le,instancingColor:Le&&B.instanceColor!==null,instancingMorph:Le&&B.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:oe===null?i.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:bi,alphaToCoverage:!!S.alphaToCoverage,map:Xe,matcap:et,envMap:N,envMapMode:N&&$.mapping,envMapCubeUVHeight:G,aoMap:ce,lightMap:ae,bumpMap:ne,normalMap:se,displacementMap:f&&xe,emissiveMap:he,normalMapObjectSpace:se&&S.normalMapType===du,normalMapTangentSpace:se&&S.normalMapType===za,metalnessMap:ye,roughnessMap:Ge,anisotropy:Be,anisotropyMap:k,clearcoat:D,clearcoatMap:J,clearcoatNormalMap:ee,clearcoatRoughnessMap:de,dispersion:M,iridescence:I,iridescenceMap:pe,iridescenceThicknessMap:C,sheen:O,sheenColorMap:Z,sheenRoughnessMap:j,specularMap:Y,specularColorMap:te,specularIntensityMap:Ee,transmission:H,transmissionMap:F,thicknessMap:re,gradientMap:ve,opaque:S.transparent===!1&&S.blending===Mi&&S.alphaToCoverage===!1,alphaMap:Ae,alphaTest:fe,alphaHash:le,combine:S.combine,mapUv:Xe&&y(S.map.channel),aoMapUv:ce&&y(S.aoMap.channel),lightMapUv:ae&&y(S.lightMap.channel),bumpMapUv:ne&&y(S.bumpMap.channel),normalMapUv:se&&y(S.normalMap.channel),displacementMapUv:xe&&y(S.displacementMap.channel),emissiveMapUv:he&&y(S.emissiveMap.channel),metalnessMapUv:ye&&y(S.metalnessMap.channel),roughnessMapUv:Ge&&y(S.roughnessMap.channel),anisotropyMapUv:k&&y(S.anisotropyMap.channel),clearcoatMapUv:J&&y(S.clearcoatMap.channel),clearcoatNormalMapUv:ee&&y(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&y(S.clearcoatRoughnessMap.channel),iridescenceMapUv:pe&&y(S.iridescenceMap.channel),iridescenceThicknessMapUv:C&&y(S.iridescenceThicknessMap.channel),sheenColorMapUv:Z&&y(S.sheenColorMap.channel),sheenRoughnessMapUv:j&&y(S.sheenRoughnessMap.channel),specularMapUv:Y&&y(S.specularMap.channel),specularColorMapUv:te&&y(S.specularColorMap.channel),specularIntensityMapUv:Ee&&y(S.specularIntensityMap.channel),transmissionMapUv:F&&y(S.transmissionMap.channel),thicknessMapUv:re&&y(S.thicknessMap.channel),alphaMapUv:Ae&&y(S.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(se||Be),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!z.attributes.uv&&(Xe||Ae),fog:!!q,useFog:S.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:Ce,skinning:B.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Se,morphTextureStride:Me,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&E.length>0,shadowMapType:i.shadowMap.type,toneMapping:ze,decodeVideoTexture:Xe&&S.map.isVideoTexture===!0&&nt.getTransfer(S.map.colorSpace)===lt,decodeVideoTextureEmissive:he&&S.emissiveMap.isVideoTexture===!0&&nt.getTransfer(S.emissiveMap.colorSpace)===lt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Pt,flipSided:S.side===Mt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ie&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ie&&S.extensions.multiDraw===!0||Pe)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return we.vertexUv1s=c.has(1),we.vertexUv2s=c.has(2),we.vertexUv3s=c.has(3),c.clear(),we}function d(S){let v=[];if(S.shaderID?v.push(S.shaderID):(v.push(S.customVertexShaderID),v.push(S.customFragmentShaderID)),S.defines!==void 0)for(let E in S.defines)v.push(E),v.push(S.defines[E]);return S.isRawShaderMaterial===!1&&(b(v,S),x(v,S),v.push(i.outputColorSpace)),v.push(S.customProgramCacheKey),v.join()}function b(S,v){S.push(v.precision),S.push(v.outputColorSpace),S.push(v.envMapMode),S.push(v.envMapCubeUVHeight),S.push(v.mapUv),S.push(v.alphaMapUv),S.push(v.lightMapUv),S.push(v.aoMapUv),S.push(v.bumpMapUv),S.push(v.normalMapUv),S.push(v.displacementMapUv),S.push(v.emissiveMapUv),S.push(v.metalnessMapUv),S.push(v.roughnessMapUv),S.push(v.anisotropyMapUv),S.push(v.clearcoatMapUv),S.push(v.clearcoatNormalMapUv),S.push(v.clearcoatRoughnessMapUv),S.push(v.iridescenceMapUv),S.push(v.iridescenceThicknessMapUv),S.push(v.sheenColorMapUv),S.push(v.sheenRoughnessMapUv),S.push(v.specularMapUv),S.push(v.specularColorMapUv),S.push(v.specularIntensityMapUv),S.push(v.transmissionMapUv),S.push(v.thicknessMapUv),S.push(v.combine),S.push(v.fogExp2),S.push(v.sizeAttenuation),S.push(v.morphTargetsCount),S.push(v.morphAttributeCount),S.push(v.numDirLights),S.push(v.numPointLights),S.push(v.numSpotLights),S.push(v.numSpotLightMaps),S.push(v.numHemiLights),S.push(v.numRectAreaLights),S.push(v.numDirLightShadows),S.push(v.numPointLightShadows),S.push(v.numSpotLightShadows),S.push(v.numSpotLightShadowsWithMaps),S.push(v.numLightProbes),S.push(v.shadowMapType),S.push(v.toneMapping),S.push(v.numClippingPlanes),S.push(v.numClipIntersection),S.push(v.depthPacking)}function x(S,v){a.disableAll(),v.supportsVertexTextures&&a.enable(0),v.instancing&&a.enable(1),v.instancingColor&&a.enable(2),v.instancingMorph&&a.enable(3),v.matcap&&a.enable(4),v.envMap&&a.enable(5),v.normalMapObjectSpace&&a.enable(6),v.normalMapTangentSpace&&a.enable(7),v.clearcoat&&a.enable(8),v.iridescence&&a.enable(9),v.alphaTest&&a.enable(10),v.vertexColors&&a.enable(11),v.vertexAlphas&&a.enable(12),v.vertexUv1s&&a.enable(13),v.vertexUv2s&&a.enable(14),v.vertexUv3s&&a.enable(15),v.vertexTangents&&a.enable(16),v.anisotropy&&a.enable(17),v.alphaHash&&a.enable(18),v.batching&&a.enable(19),v.dispersion&&a.enable(20),v.batchingColor&&a.enable(21),v.gradientMap&&a.enable(22),S.push(a.mask),a.disableAll(),v.fog&&a.enable(0),v.useFog&&a.enable(1),v.flatShading&&a.enable(2),v.logarithmicDepthBuffer&&a.enable(3),v.reversedDepthBuffer&&a.enable(4),v.skinning&&a.enable(5),v.morphTargets&&a.enable(6),v.morphNormals&&a.enable(7),v.morphColors&&a.enable(8),v.premultipliedAlpha&&a.enable(9),v.shadowMapEnabled&&a.enable(10),v.doubleSided&&a.enable(11),v.flipSided&&a.enable(12),v.useDepthPacking&&a.enable(13),v.dithering&&a.enable(14),v.transmission&&a.enable(15),v.sheen&&a.enable(16),v.opaque&&a.enable(17),v.pointsUvs&&a.enable(18),v.decodeVideoTexture&&a.enable(19),v.decodeVideoTextureEmissive&&a.enable(20),v.alphaToCoverage&&a.enable(21),S.push(a.mask)}function g(S){let v=_[S.type],E;if(v){let L=Rn[v];E=bu.clone(L.uniforms)}else E=S.uniforms;return E}function R(S,v){let E;for(let L=0,B=h.length;L<B;L++){let q=h[L];if(q.cacheKey===v){E=q,++E.usedTimes;break}}return E===void 0&&(E=new m_(i,v,S,r),h.push(E)),E}function T(S){if(--S.usedTimes===0){let v=h.indexOf(S);h[v]=h[h.length-1],h.pop(),S.destroy()}}function w(S){l.remove(S)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:g,acquireProgram:R,releaseProgram:T,releaseShaderCache:w,programs:h,dispose:P}}function x_(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function y_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Ju(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function $u(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,f,p,_,y,m){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:_,renderOrder:u.renderOrder,z:y,group:m},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=_,d.renderOrder=u.renderOrder,d.z=y,d.group=m),e++,d}function a(u,f,p,_,y,m){let d=o(u,f,p,_,y,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function l(u,f,p,_,y,m){let d=o(u,f,p,_,y,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,f){t.length>1&&t.sort(u||y_),n.length>1&&n.sort(f||Ju),s.length>1&&s.sort(f||Ju)}function h(){for(let u=e,f=i.length;u<f;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function v_(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new $u,i.set(n,[o])):s>=r.length?(o=new $u,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function M_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new U,color:new He};break;case"SpotLight":t={position:new U,direction:new U,color:new He,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new He,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new He,groundColor:new He};break;case"RectAreaLight":t={color:new He,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function S_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var b_=0;function E_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function w_(i){let e=new M_,t=S_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);let s=new U,r=new Qe,o=new Qe;function a(c){let h=0,u=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,_=0,y=0,m=0,d=0,b=0,x=0,g=0,R=0,T=0,w=0;c.sort(E_);for(let S=0,v=c.length;S<v;S++){let E=c[S],L=E.color,B=E.intensity,q=E.distance,z=E.shadow&&E.shadow.map?E.shadow.map.texture:null;if(E.isAmbientLight)h+=L.r*B,u+=L.g*B,f+=L.b*B;else if(E.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(E.sh.coefficients[V],B);w++}else if(E.isDirectionalLight){let V=e.get(E);if(V.color.copy(E.color).multiplyScalar(E.intensity),E.castShadow){let $=E.shadow,G=t.get(E);G.shadowIntensity=$.intensity,G.shadowBias=$.bias,G.shadowNormalBias=$.normalBias,G.shadowRadius=$.radius,G.shadowMapSize=$.mapSize,n.directionalShadow[p]=G,n.directionalShadowMap[p]=z,n.directionalShadowMatrix[p]=E.shadow.matrix,b++}n.directional[p]=V,p++}else if(E.isSpotLight){let V=e.get(E);V.position.setFromMatrixPosition(E.matrixWorld),V.color.copy(L).multiplyScalar(B),V.distance=q,V.coneCos=Math.cos(E.angle),V.penumbraCos=Math.cos(E.angle*(1-E.penumbra)),V.decay=E.decay,n.spot[y]=V;let $=E.shadow;if(E.map&&(n.spotLightMap[R]=E.map,R++,$.updateMatrices(E),E.castShadow&&T++),n.spotLightMatrix[y]=$.matrix,E.castShadow){let G=t.get(E);G.shadowIntensity=$.intensity,G.shadowBias=$.bias,G.shadowNormalBias=$.normalBias,G.shadowRadius=$.radius,G.shadowMapSize=$.mapSize,n.spotShadow[y]=G,n.spotShadowMap[y]=z,g++}y++}else if(E.isRectAreaLight){let V=e.get(E);V.color.copy(L).multiplyScalar(B),V.halfWidth.set(E.width*.5,0,0),V.halfHeight.set(0,E.height*.5,0),n.rectArea[m]=V,m++}else if(E.isPointLight){let V=e.get(E);if(V.color.copy(E.color).multiplyScalar(E.intensity),V.distance=E.distance,V.decay=E.decay,E.castShadow){let $=E.shadow,G=t.get(E);G.shadowIntensity=$.intensity,G.shadowBias=$.bias,G.shadowNormalBias=$.normalBias,G.shadowRadius=$.radius,G.shadowMapSize=$.mapSize,G.shadowCameraNear=$.camera.near,G.shadowCameraFar=$.camera.far,n.pointShadow[_]=G,n.pointShadowMap[_]=z,n.pointShadowMatrix[_]=E.shadow.matrix,x++}n.point[_]=V,_++}else if(E.isHemisphereLight){let V=e.get(E);V.skyColor.copy(E.color).multiplyScalar(B),V.groundColor.copy(E.groundColor).multiplyScalar(B),n.hemi[d]=V,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Te.LTC_FLOAT_1,n.rectAreaLTC2=Te.LTC_FLOAT_2):(n.rectAreaLTC1=Te.LTC_HALF_1,n.rectAreaLTC2=Te.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;let P=n.hash;(P.directionalLength!==p||P.pointLength!==_||P.spotLength!==y||P.rectAreaLength!==m||P.hemiLength!==d||P.numDirectionalShadows!==b||P.numPointShadows!==x||P.numSpotShadows!==g||P.numSpotMaps!==R||P.numLightProbes!==w)&&(n.directional.length=p,n.spot.length=y,n.rectArea.length=m,n.point.length=_,n.hemi.length=d,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=g,n.spotShadowMap.length=g,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=g+R-T,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=w,P.directionalLength=p,P.pointLength=_,P.spotLength=y,P.rectAreaLength=m,P.hemiLength=d,P.numDirectionalShadows=b,P.numPointShadows=x,P.numSpotShadows=g,P.numSpotMaps=R,P.numLightProbes=w,n.version=b_++)}function l(c,h){let u=0,f=0,p=0,_=0,y=0,m=h.matrixWorldInverse;for(let d=0,b=c.length;d<b;d++){let x=c[d];if(x.isDirectionalLight){let g=n.directional[u];g.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),g.direction.sub(s),g.direction.transformDirection(m),u++}else if(x.isSpotLight){let g=n.spot[p];g.position.setFromMatrixPosition(x.matrixWorld),g.position.applyMatrix4(m),g.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),g.direction.sub(s),g.direction.transformDirection(m),p++}else if(x.isRectAreaLight){let g=n.rectArea[_];g.position.setFromMatrixPosition(x.matrixWorld),g.position.applyMatrix4(m),o.identity(),r.copy(x.matrixWorld),r.premultiply(m),o.extractRotation(r),g.halfWidth.set(x.width*.5,0,0),g.halfHeight.set(0,x.height*.5,0),g.halfWidth.applyMatrix4(o),g.halfHeight.applyMatrix4(o),_++}else if(x.isPointLight){let g=n.point[f];g.position.setFromMatrixPosition(x.matrixWorld),g.position.applyMatrix4(m),f++}else if(x.isHemisphereLight){let g=n.hemi[y];g.direction.setFromMatrixPosition(x.matrixWorld),g.direction.transformDirection(m),y++}}}return{setup:a,setupView:l,state:n}}function Ku(i){let e=new w_(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function T_(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Ku(i),e.set(s,[a])):r>=o.length?(a=new Ku(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var A_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,R_=`uniform sampler2D shadow_pass;
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
}`;function C_(i,e,t){let n=new rs,s=new _e,r=new _e,o=new rt,a=new si({depthPacking:ps}),l=new Lo,c={},h=t.maxTextureSize,u={[Vt]:Mt,[Mt]:Vt,[Pt]:Pt},f=new vn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _e},radius:{value:4}},vertexShader:A_,fragmentShader:R_}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let _=new it;_.setAttribute("position",new Ve(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Ke(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=br;let d=this.type;this.render=function(T,w,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;let S=i.getRenderTarget(),v=i.getActiveCubeFace(),E=i.getActiveMipmapLevel(),L=i.state;L.setBlending(zn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let B=d!==An&&this.type===An,q=d===An&&this.type!==An;for(let z=0,V=T.length;z<V;z++){let $=T[z],G=$.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let ue=G.getFrameExtents();if(s.multiply(ue),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ue.x),s.x=r.x*ue.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ue.y),s.y=r.y*ue.y,G.mapSize.y=r.y)),G.map===null||B===!0||q===!0){let Se=this.type!==An?{minFilter:Ut,magFilter:Ut}:{};G.map!==null&&G.map.dispose(),G.map=new hn(s.x,s.y,Se),G.map.texture.name=$.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();let me=G.getViewportCount();for(let Se=0;Se<me;Se++){let Me=G.getViewport(Se);o.set(r.x*Me.x,r.y*Me.y,r.x*Me.z,r.y*Me.w),L.viewport(o),G.updateMatrices($,Se),n=G.getFrustum(),g(w,P,G.camera,$,this.type)}G.isPointLightShadow!==!0&&this.type===An&&b(G,P),G.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(S,v,E)};function b(T,w){let P=e.update(y);f.defines.VSM_SAMPLES!==T.blurSamples&&(f.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new hn(s.x,s.y)),f.uniforms.shadow_pass.value=T.map.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(w,null,P,f,y,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(w,null,P,p,y,null)}function x(T,w,P,S){let v=null,E=P.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(E!==void 0)v=E;else if(v=P.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let L=v.uuid,B=w.uuid,q=c[L];q===void 0&&(q={},c[L]=q);let z=q[B];z===void 0&&(z=v.clone(),q[B]=z,w.addEventListener("dispose",R)),v=z}if(v.visible=w.visible,v.wireframe=w.wireframe,S===An?v.side=w.shadowSide!==null?w.shadowSide:w.side:v.side=w.shadowSide!==null?w.shadowSide:u[w.side],v.alphaMap=w.alphaMap,v.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,v.map=w.map,v.clipShadows=w.clipShadows,v.clippingPlanes=w.clippingPlanes,v.clipIntersection=w.clipIntersection,v.displacementMap=w.displacementMap,v.displacementScale=w.displacementScale,v.displacementBias=w.displacementBias,v.wireframeLinewidth=w.wireframeLinewidth,v.linewidth=w.linewidth,P.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let L=i.properties.get(v);L.light=P}return v}function g(T,w,P,S,v){if(T.visible===!1)return;if(T.layers.test(w.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&v===An)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,T.matrixWorld);let B=e.update(T),q=T.material;if(Array.isArray(q)){let z=B.groups;for(let V=0,$=z.length;V<$;V++){let G=z[V],ue=q[G.materialIndex];if(ue&&ue.visible){let me=x(T,ue,S,v);T.onBeforeShadow(i,T,w,P,B,me,G),i.renderBufferDirect(P,null,B,me,T,G),T.onAfterShadow(i,T,w,P,B,me,G)}}}else if(q.visible){let z=x(T,q,S,v);T.onBeforeShadow(i,T,w,P,B,z,null),i.renderBufferDirect(P,null,B,z,T,null),T.onAfterShadow(i,T,w,P,B,z,null)}}let L=T.children;for(let B=0,q=L.length;B<q;B++)g(L[B],w,P,S,v)}function R(T){T.target.removeEventListener("dispose",R);for(let P in c){let S=c[P],v=T.target.uuid;v in S&&(S[v].dispose(),delete S[v])}}}var I_={[qo]:Yo,[Zo]:Ko,[Jo]:jo,[Si]:$o,[Yo]:qo,[Ko]:Zo,[jo]:Jo,[$o]:Si};function P_(i,e){function t(){let F=!1,re=new rt,ve=null,Ae=new rt(0,0,0,0);return{setMask:function(fe){ve!==fe&&!F&&(i.colorMask(fe,fe,fe,fe),ve=fe)},setLocked:function(fe){F=fe},setClear:function(fe,le,Ie,ze,we){we===!0&&(fe*=ze,le*=ze,Ie*=ze),re.set(fe,le,Ie,ze),Ae.equals(re)===!1&&(i.clearColor(fe,le,Ie,ze),Ae.copy(re))},reset:function(){F=!1,ve=null,Ae.set(-1,0,0,0)}}}function n(){let F=!1,re=!1,ve=null,Ae=null,fe=null;return{setReversed:function(le){if(re!==le){let Ie=e.get("EXT_clip_control");le?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),re=le;let ze=fe;fe=null,this.setClear(ze)}},getReversed:function(){return re},setTest:function(le){le?oe(i.DEPTH_TEST):Ce(i.DEPTH_TEST)},setMask:function(le){ve!==le&&!F&&(i.depthMask(le),ve=le)},setFunc:function(le){if(re&&(le=I_[le]),Ae!==le){switch(le){case qo:i.depthFunc(i.NEVER);break;case Yo:i.depthFunc(i.ALWAYS);break;case Zo:i.depthFunc(i.LESS);break;case Si:i.depthFunc(i.LEQUAL);break;case Jo:i.depthFunc(i.EQUAL);break;case $o:i.depthFunc(i.GEQUAL);break;case Ko:i.depthFunc(i.GREATER);break;case jo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Ae=le}},setLocked:function(le){F=le},setClear:function(le){fe!==le&&(re&&(le=1-le),i.clearDepth(le),fe=le)},reset:function(){F=!1,ve=null,Ae=null,fe=null,re=!1}}}function s(){let F=!1,re=null,ve=null,Ae=null,fe=null,le=null,Ie=null,ze=null,we=null;return{setTest:function(be){F||(be?oe(i.STENCIL_TEST):Ce(i.STENCIL_TEST))},setMask:function(be){re!==be&&!F&&(i.stencilMask(be),re=be)},setFunc:function(be,Je,xt){(ve!==be||Ae!==Je||fe!==xt)&&(i.stencilFunc(be,Je,xt),ve=be,Ae=Je,fe=xt)},setOp:function(be,Je,xt){(le!==be||Ie!==Je||ze!==xt)&&(i.stencilOp(be,Je,xt),le=be,Ie=Je,ze=xt)},setLocked:function(be){F=be},setClear:function(be){we!==be&&(i.clearStencil(be),we=be)},reset:function(){F=!1,re=null,ve=null,Ae=null,fe=null,le=null,Ie=null,ze=null,we=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,p=[],_=null,y=!1,m=null,d=null,b=null,x=null,g=null,R=null,T=null,w=new He(0,0,0),P=0,S=!1,v=null,E=null,L=null,B=null,q=null,z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,$=0,G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(G)[1]),V=$>=1):G.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),V=$>=2);let ue=null,me={},Se=i.getParameter(i.SCISSOR_BOX),Me=i.getParameter(i.VIEWPORT),Fe=new rt().fromArray(Se),Ze=new rt().fromArray(Me);function Ye(F,re,ve,Ae){let fe=new Uint8Array(4),le=i.createTexture();i.bindTexture(F,le),i.texParameteri(F,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(F,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ie=0;Ie<ve;Ie++)F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?i.texImage3D(re,0,i.RGBA,1,1,Ae,0,i.RGBA,i.UNSIGNED_BYTE,fe):i.texImage2D(re+Ie,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,fe);return le}let ie={};ie[i.TEXTURE_2D]=Ye(i.TEXTURE_2D,i.TEXTURE_2D,1),ie[i.TEXTURE_CUBE_MAP]=Ye(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[i.TEXTURE_2D_ARRAY]=Ye(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ie[i.TEXTURE_3D]=Ye(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(i.DEPTH_TEST),o.setFunc(Si),ne(!1),se(Zl),oe(i.CULL_FACE),ce(zn);function oe(F){h[F]!==!0&&(i.enable(F),h[F]=!0)}function Ce(F){h[F]!==!1&&(i.disable(F),h[F]=!1)}function Le(F,re){return u[F]!==re?(i.bindFramebuffer(F,re),u[F]=re,F===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=re),F===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=re),!0):!1}function Pe(F,re){let ve=p,Ae=!1;if(F){ve=f.get(re),ve===void 0&&(ve=[],f.set(re,ve));let fe=F.textures;if(ve.length!==fe.length||ve[0]!==i.COLOR_ATTACHMENT0){for(let le=0,Ie=fe.length;le<Ie;le++)ve[le]=i.COLOR_ATTACHMENT0+le;ve.length=fe.length,Ae=!0}}else ve[0]!==i.BACK&&(ve[0]=i.BACK,Ae=!0);Ae&&i.drawBuffers(ve)}function Xe(F){return _!==F?(i.useProgram(F),_=F,!0):!1}let et={[ei]:i.FUNC_ADD,[zh]:i.FUNC_SUBTRACT,[kh]:i.FUNC_REVERSE_SUBTRACT};et[Hh]=i.MIN,et[Vh]=i.MAX;let N={[Gh]:i.ZERO,[Wh]:i.ONE,[Xh]:i.SRC_COLOR,[po]:i.SRC_ALPHA,[Kh]:i.SRC_ALPHA_SATURATE,[Jh]:i.DST_COLOR,[Yh]:i.DST_ALPHA,[qh]:i.ONE_MINUS_SRC_COLOR,[mo]:i.ONE_MINUS_SRC_ALPHA,[$h]:i.ONE_MINUS_DST_COLOR,[Zh]:i.ONE_MINUS_DST_ALPHA,[jh]:i.CONSTANT_COLOR,[Qh]:i.ONE_MINUS_CONSTANT_COLOR,[eu]:i.CONSTANT_ALPHA,[tu]:i.ONE_MINUS_CONSTANT_ALPHA};function ce(F,re,ve,Ae,fe,le,Ie,ze,we,be){if(F===zn){y===!0&&(Ce(i.BLEND),y=!1);return}if(y===!1&&(oe(i.BLEND),y=!0),F!==Bh){if(F!==m||be!==S){if((d!==ei||g!==ei)&&(i.blendEquation(i.FUNC_ADD),d=ei,g=ei),be)switch(F){case Mi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jl:i.blendFunc(i.ONE,i.ONE);break;case $l:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Kl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case Mi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case $l:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Kl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}b=null,x=null,R=null,T=null,w.set(0,0,0),P=0,m=F,S=be}return}fe=fe||re,le=le||ve,Ie=Ie||Ae,(re!==d||fe!==g)&&(i.blendEquationSeparate(et[re],et[fe]),d=re,g=fe),(ve!==b||Ae!==x||le!==R||Ie!==T)&&(i.blendFuncSeparate(N[ve],N[Ae],N[le],N[Ie]),b=ve,x=Ae,R=le,T=Ie),(ze.equals(w)===!1||we!==P)&&(i.blendColor(ze.r,ze.g,ze.b,we),w.copy(ze),P=we),m=F,S=!1}function ae(F,re){F.side===Pt?Ce(i.CULL_FACE):oe(i.CULL_FACE);let ve=F.side===Mt;re&&(ve=!ve),ne(ve),F.blending===Mi&&F.transparent===!1?ce(zn):ce(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let Ae=F.stencilWrite;a.setTest(Ae),Ae&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),he(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?oe(i.SAMPLE_ALPHA_TO_COVERAGE):Ce(i.SAMPLE_ALPHA_TO_COVERAGE)}function ne(F){v!==F&&(F?i.frontFace(i.CW):i.frontFace(i.CCW),v=F)}function se(F){F!==Fh?(oe(i.CULL_FACE),F!==E&&(F===Zl?i.cullFace(i.BACK):F===Oh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ce(i.CULL_FACE),E=F}function xe(F){F!==L&&(V&&i.lineWidth(F),L=F)}function he(F,re,ve){F?(oe(i.POLYGON_OFFSET_FILL),(B!==re||q!==ve)&&(i.polygonOffset(re,ve),B=re,q=ve)):Ce(i.POLYGON_OFFSET_FILL)}function ye(F){F?oe(i.SCISSOR_TEST):Ce(i.SCISSOR_TEST)}function Ge(F){F===void 0&&(F=i.TEXTURE0+z-1),ue!==F&&(i.activeTexture(F),ue=F)}function Be(F,re,ve){ve===void 0&&(ue===null?ve=i.TEXTURE0+z-1:ve=ue);let Ae=me[ve];Ae===void 0&&(Ae={type:void 0,texture:void 0},me[ve]=Ae),(Ae.type!==F||Ae.texture!==re)&&(ue!==ve&&(i.activeTexture(ve),ue=ve),i.bindTexture(F,re||ie[F]),Ae.type=F,Ae.texture=re)}function D(){let F=me[ue];F!==void 0&&F.type!==void 0&&(i.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function M(){try{i.compressedTexImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function I(){try{i.compressedTexImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function O(){try{i.texSubImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function H(){try{i.texSubImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function k(){try{i.compressedTexSubImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function J(){try{i.compressedTexSubImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ee(){try{i.texStorage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function de(){try{i.texStorage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function pe(){try{i.texImage2D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function C(){try{i.texImage3D(...arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Z(F){Fe.equals(F)===!1&&(i.scissor(F.x,F.y,F.z,F.w),Fe.copy(F))}function j(F){Ze.equals(F)===!1&&(i.viewport(F.x,F.y,F.z,F.w),Ze.copy(F))}function Y(F,re){let ve=c.get(re);ve===void 0&&(ve=new WeakMap,c.set(re,ve));let Ae=ve.get(F);Ae===void 0&&(Ae=i.getUniformBlockIndex(re,F.name),ve.set(F,Ae))}function te(F,re){let Ae=c.get(re).get(F);l.get(re)!==Ae&&(i.uniformBlockBinding(re,Ae,F.__bindingPointIndex),l.set(re,Ae))}function Ee(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ue=null,me={},u={},f=new WeakMap,p=[],_=null,y=!1,m=null,d=null,b=null,x=null,g=null,R=null,T=null,w=new He(0,0,0),P=0,S=!1,v=null,E=null,L=null,B=null,q=null,Fe.set(0,0,i.canvas.width,i.canvas.height),Ze.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:oe,disable:Ce,bindFramebuffer:Le,drawBuffers:Pe,useProgram:Xe,setBlending:ce,setMaterial:ae,setFlipSided:ne,setCullFace:se,setLineWidth:xe,setPolygonOffset:he,setScissorTest:ye,activeTexture:Ge,bindTexture:Be,unbindTexture:D,compressedTexImage2D:M,compressedTexImage3D:I,texImage2D:pe,texImage3D:C,updateUBOMapping:Y,uniformBlockBinding:te,texStorage2D:ee,texStorage3D:de,texSubImage2D:O,texSubImage3D:H,compressedTexSubImage2D:k,compressedTexSubImage3D:J,scissor:Z,viewport:j,reset:Ee}}function D_(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new _e,h=new WeakMap,u,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(D,M){return p?new OffscreenCanvas(D,M):Zs("canvas")}function y(D,M,I){let O=1,H=Be(D);if((H.width>I||H.height>I)&&(O=I/Math.max(H.width,H.height)),O<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){let k=Math.floor(O*H.width),J=Math.floor(O*H.height);u===void 0&&(u=_(k,J));let ee=M?_(k,J):u;return ee.width=k,ee.height=J,ee.getContext("2d").drawImage(D,0,0,k,J),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+H.width+"x"+H.height+") to ("+k+"x"+J+")."),ee}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+H.width+"x"+H.height+")."),D;return D}function m(D){return D.generateMipmaps}function d(D){i.generateMipmap(D)}function b(D){return D.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?i.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function x(D,M,I,O,H=!1){if(D!==null){if(i[D]!==void 0)return i[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let k=M;if(M===i.RED&&(I===i.FLOAT&&(k=i.R32F),I===i.HALF_FLOAT&&(k=i.R16F),I===i.UNSIGNED_BYTE&&(k=i.R8)),M===i.RED_INTEGER&&(I===i.UNSIGNED_BYTE&&(k=i.R8UI),I===i.UNSIGNED_SHORT&&(k=i.R16UI),I===i.UNSIGNED_INT&&(k=i.R32UI),I===i.BYTE&&(k=i.R8I),I===i.SHORT&&(k=i.R16I),I===i.INT&&(k=i.R32I)),M===i.RG&&(I===i.FLOAT&&(k=i.RG32F),I===i.HALF_FLOAT&&(k=i.RG16F),I===i.UNSIGNED_BYTE&&(k=i.RG8)),M===i.RG_INTEGER&&(I===i.UNSIGNED_BYTE&&(k=i.RG8UI),I===i.UNSIGNED_SHORT&&(k=i.RG16UI),I===i.UNSIGNED_INT&&(k=i.RG32UI),I===i.BYTE&&(k=i.RG8I),I===i.SHORT&&(k=i.RG16I),I===i.INT&&(k=i.RG32I)),M===i.RGB_INTEGER&&(I===i.UNSIGNED_BYTE&&(k=i.RGB8UI),I===i.UNSIGNED_SHORT&&(k=i.RGB16UI),I===i.UNSIGNED_INT&&(k=i.RGB32UI),I===i.BYTE&&(k=i.RGB8I),I===i.SHORT&&(k=i.RGB16I),I===i.INT&&(k=i.RGB32I)),M===i.RGBA_INTEGER&&(I===i.UNSIGNED_BYTE&&(k=i.RGBA8UI),I===i.UNSIGNED_SHORT&&(k=i.RGBA16UI),I===i.UNSIGNED_INT&&(k=i.RGBA32UI),I===i.BYTE&&(k=i.RGBA8I),I===i.SHORT&&(k=i.RGBA16I),I===i.INT&&(k=i.RGBA32I)),M===i.RGB&&(I===i.UNSIGNED_INT_5_9_9_9_REV&&(k=i.RGB9_E5),I===i.UNSIGNED_INT_10F_11F_11F_REV&&(k=i.R11F_G11F_B10F)),M===i.RGBA){let J=H?qs:nt.getTransfer(O);I===i.FLOAT&&(k=i.RGBA32F),I===i.HALF_FLOAT&&(k=i.RGBA16F),I===i.UNSIGNED_BYTE&&(k=J===lt?i.SRGB8_ALPHA8:i.RGBA8),I===i.UNSIGNED_SHORT_4_4_4_4&&(k=i.RGBA4),I===i.UNSIGNED_SHORT_5_5_5_1&&(k=i.RGB5_A1)}return(k===i.R16F||k===i.R32F||k===i.RG16F||k===i.RG32F||k===i.RGBA16F||k===i.RGBA32F)&&e.get("EXT_color_buffer_float"),k}function g(D,M){let I;return D?M===null||M===li||M===ds?I=i.DEPTH24_STENCIL8:M===sn?I=i.DEPTH32F_STENCIL8:M===hs&&(I=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===li||M===ds?I=i.DEPTH_COMPONENT24:M===sn?I=i.DEPTH_COMPONENT32F:M===hs&&(I=i.DEPTH_COMPONENT16),I}function R(D,M){return m(D)===!0||D.isFramebufferTexture&&D.minFilter!==Ut&&D.minFilter!==Gt?Math.log2(Math.max(M.width,M.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?M.mipmaps.length:1}function T(D){let M=D.target;M.removeEventListener("dispose",T),P(M),M.isVideoTexture&&h.delete(M)}function w(D){let M=D.target;M.removeEventListener("dispose",w),v(M)}function P(D){let M=n.get(D);if(M.__webglInit===void 0)return;let I=D.source,O=f.get(I);if(O){let H=O[M.__cacheKey];H.usedTimes--,H.usedTimes===0&&S(D),Object.keys(O).length===0&&f.delete(I)}n.remove(D)}function S(D){let M=n.get(D);i.deleteTexture(M.__webglTexture);let I=D.source,O=f.get(I);delete O[M.__cacheKey],o.memory.textures--}function v(D){let M=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let O=0;O<6;O++){if(Array.isArray(M.__webglFramebuffer[O]))for(let H=0;H<M.__webglFramebuffer[O].length;H++)i.deleteFramebuffer(M.__webglFramebuffer[O][H]);else i.deleteFramebuffer(M.__webglFramebuffer[O]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[O])}else{if(Array.isArray(M.__webglFramebuffer))for(let O=0;O<M.__webglFramebuffer.length;O++)i.deleteFramebuffer(M.__webglFramebuffer[O]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let O=0;O<M.__webglColorRenderbuffer.length;O++)M.__webglColorRenderbuffer[O]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[O]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let I=D.textures;for(let O=0,H=I.length;O<H;O++){let k=n.get(I[O]);k.__webglTexture&&(i.deleteTexture(k.__webglTexture),o.memory.textures--),n.remove(I[O])}n.remove(D)}let E=0;function L(){E=0}function B(){let D=E;return D>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+s.maxTextures),E+=1,D}function q(D){let M=[];return M.push(D.wrapS),M.push(D.wrapT),M.push(D.wrapR||0),M.push(D.magFilter),M.push(D.minFilter),M.push(D.anisotropy),M.push(D.internalFormat),M.push(D.format),M.push(D.type),M.push(D.generateMipmaps),M.push(D.premultiplyAlpha),M.push(D.flipY),M.push(D.unpackAlignment),M.push(D.colorSpace),M.join()}function z(D,M){let I=n.get(D);if(D.isVideoTexture&&ye(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&I.__version!==D.version){let O=D.image;if(O===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(O.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ie(I,D,M);return}}else D.isExternalTexture&&(I.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,I.__webglTexture,i.TEXTURE0+M)}function V(D,M){let I=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&I.__version!==D.version){ie(I,D,M);return}t.bindTexture(i.TEXTURE_2D_ARRAY,I.__webglTexture,i.TEXTURE0+M)}function $(D,M){let I=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&I.__version!==D.version){ie(I,D,M);return}t.bindTexture(i.TEXTURE_3D,I.__webglTexture,i.TEXTURE0+M)}function G(D,M){let I=n.get(D);if(D.version>0&&I.__version!==D.version){oe(I,D,M);return}t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+M)}let ue={[go]:i.REPEAT,[Qn]:i.CLAMP_TO_EDGE,[_o]:i.MIRRORED_REPEAT},me={[Ut]:i.NEAREST,[hu]:i.NEAREST_MIPMAP_NEAREST,[wr]:i.NEAREST_MIPMAP_LINEAR,[Gt]:i.LINEAR,[ia]:i.LINEAR_MIPMAP_NEAREST,[ai]:i.LINEAR_MIPMAP_LINEAR},Se={[fu]:i.NEVER,[yu]:i.ALWAYS,[pu]:i.LESS,[oc]:i.LEQUAL,[mu]:i.EQUAL,[xu]:i.GEQUAL,[gu]:i.GREATER,[_u]:i.NOTEQUAL};function Me(D,M){if(M.type===sn&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===Gt||M.magFilter===ia||M.magFilter===wr||M.magFilter===ai||M.minFilter===Gt||M.minFilter===ia||M.minFilter===wr||M.minFilter===ai)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(D,i.TEXTURE_WRAP_S,ue[M.wrapS]),i.texParameteri(D,i.TEXTURE_WRAP_T,ue[M.wrapT]),(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)&&i.texParameteri(D,i.TEXTURE_WRAP_R,ue[M.wrapR]),i.texParameteri(D,i.TEXTURE_MAG_FILTER,me[M.magFilter]),i.texParameteri(D,i.TEXTURE_MIN_FILTER,me[M.minFilter]),M.compareFunction&&(i.texParameteri(D,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(D,i.TEXTURE_COMPARE_FUNC,Se[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Ut||M.minFilter!==wr&&M.minFilter!==ai||M.type===sn&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let I=e.get("EXT_texture_filter_anisotropic");i.texParameterf(D,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Fe(D,M){let I=!1;D.__webglInit===void 0&&(D.__webglInit=!0,M.addEventListener("dispose",T));let O=M.source,H=f.get(O);H===void 0&&(H={},f.set(O,H));let k=q(M);if(k!==D.__cacheKey){H[k]===void 0&&(H[k]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,I=!0),H[k].usedTimes++;let J=H[D.__cacheKey];J!==void 0&&(H[D.__cacheKey].usedTimes--,J.usedTimes===0&&S(M)),D.__cacheKey=k,D.__webglTexture=H[k].texture}return I}function Ze(D,M,I){return Math.floor(Math.floor(D/I)/M)}function Ye(D,M,I,O){let k=D.updateRanges;if(k.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,I,O,M.data);else{k.sort((C,Z)=>C.start-Z.start);let J=0;for(let C=1;C<k.length;C++){let Z=k[J],j=k[C],Y=Z.start+Z.count,te=Ze(j.start,M.width,4),Ee=Ze(Z.start,M.width,4);j.start<=Y+1&&te===Ee&&Ze(j.start+j.count-1,M.width,4)===te?Z.count=Math.max(Z.count,j.start+j.count-Z.start):(++J,k[J]=j)}k.length=J+1;let ee=i.getParameter(i.UNPACK_ROW_LENGTH),de=i.getParameter(i.UNPACK_SKIP_PIXELS),pe=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let C=0,Z=k.length;C<Z;C++){let j=k[C],Y=Math.floor(j.start/4),te=Math.ceil(j.count/4),Ee=Y%M.width,F=Math.floor(Y/M.width),re=te,ve=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ee),i.pixelStorei(i.UNPACK_SKIP_ROWS,F),t.texSubImage2D(i.TEXTURE_2D,0,Ee,F,re,ve,I,O,M.data)}D.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,ee),i.pixelStorei(i.UNPACK_SKIP_PIXELS,de),i.pixelStorei(i.UNPACK_SKIP_ROWS,pe)}}function ie(D,M,I){let O=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(O=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(O=i.TEXTURE_3D);let H=Fe(D,M),k=M.source;t.bindTexture(O,D.__webglTexture,i.TEXTURE0+I);let J=n.get(k);if(k.version!==J.__version||H===!0){t.activeTexture(i.TEXTURE0+I);let ee=nt.getPrimaries(nt.workingColorSpace),de=M.colorSpace===Hn?null:nt.getPrimaries(M.colorSpace),pe=M.colorSpace===Hn||ee===de?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);let C=y(M.image,!1,s.maxTextureSize);C=Ge(M,C);let Z=r.convert(M.format,M.colorSpace),j=r.convert(M.type),Y=x(M.internalFormat,Z,j,M.colorSpace,M.isVideoTexture);Me(O,M);let te,Ee=M.mipmaps,F=M.isVideoTexture!==!0,re=J.__version===void 0||H===!0,ve=k.dataReady,Ae=R(M,C);if(M.isDepthTexture)Y=g(M.format===fs,M.type),re&&(F?t.texStorage2D(i.TEXTURE_2D,1,Y,C.width,C.height):t.texImage2D(i.TEXTURE_2D,0,Y,C.width,C.height,0,Z,j,null));else if(M.isDataTexture)if(Ee.length>0){F&&re&&t.texStorage2D(i.TEXTURE_2D,Ae,Y,Ee[0].width,Ee[0].height);for(let fe=0,le=Ee.length;fe<le;fe++)te=Ee[fe],F?ve&&t.texSubImage2D(i.TEXTURE_2D,fe,0,0,te.width,te.height,Z,j,te.data):t.texImage2D(i.TEXTURE_2D,fe,Y,te.width,te.height,0,Z,j,te.data);M.generateMipmaps=!1}else F?(re&&t.texStorage2D(i.TEXTURE_2D,Ae,Y,C.width,C.height),ve&&Ye(M,C,Z,j)):t.texImage2D(i.TEXTURE_2D,0,Y,C.width,C.height,0,Z,j,C.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){F&&re&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ae,Y,Ee[0].width,Ee[0].height,C.depth);for(let fe=0,le=Ee.length;fe<le;fe++)if(te=Ee[fe],M.format!==Xt)if(Z!==null)if(F){if(ve)if(M.layerUpdates.size>0){let Ie=fc(te.width,te.height,M.format,M.type);for(let ze of M.layerUpdates){let we=te.data.subarray(ze*Ie/te.data.BYTES_PER_ELEMENT,(ze+1)*Ie/te.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,fe,0,0,ze,te.width,te.height,1,Z,we)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,fe,0,0,0,te.width,te.height,C.depth,Z,te.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,fe,Y,te.width,te.height,C.depth,0,te.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else F?ve&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,fe,0,0,0,te.width,te.height,C.depth,Z,j,te.data):t.texImage3D(i.TEXTURE_2D_ARRAY,fe,Y,te.width,te.height,C.depth,0,Z,j,te.data)}else{F&&re&&t.texStorage2D(i.TEXTURE_2D,Ae,Y,Ee[0].width,Ee[0].height);for(let fe=0,le=Ee.length;fe<le;fe++)te=Ee[fe],M.format!==Xt?Z!==null?F?ve&&t.compressedTexSubImage2D(i.TEXTURE_2D,fe,0,0,te.width,te.height,Z,te.data):t.compressedTexImage2D(i.TEXTURE_2D,fe,Y,te.width,te.height,0,te.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):F?ve&&t.texSubImage2D(i.TEXTURE_2D,fe,0,0,te.width,te.height,Z,j,te.data):t.texImage2D(i.TEXTURE_2D,fe,Y,te.width,te.height,0,Z,j,te.data)}else if(M.isDataArrayTexture)if(F){if(re&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ae,Y,C.width,C.height,C.depth),ve)if(M.layerUpdates.size>0){let fe=fc(C.width,C.height,M.format,M.type);for(let le of M.layerUpdates){let Ie=C.data.subarray(le*fe/C.data.BYTES_PER_ELEMENT,(le+1)*fe/C.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,le,C.width,C.height,1,Z,j,Ie)}M.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,C.width,C.height,C.depth,Z,j,C.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Y,C.width,C.height,C.depth,0,Z,j,C.data);else if(M.isData3DTexture)F?(re&&t.texStorage3D(i.TEXTURE_3D,Ae,Y,C.width,C.height,C.depth),ve&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,C.width,C.height,C.depth,Z,j,C.data)):t.texImage3D(i.TEXTURE_3D,0,Y,C.width,C.height,C.depth,0,Z,j,C.data);else if(M.isFramebufferTexture){if(re)if(F)t.texStorage2D(i.TEXTURE_2D,Ae,Y,C.width,C.height);else{let fe=C.width,le=C.height;for(let Ie=0;Ie<Ae;Ie++)t.texImage2D(i.TEXTURE_2D,Ie,Y,fe,le,0,Z,j,null),fe>>=1,le>>=1}}else if(Ee.length>0){if(F&&re){let fe=Be(Ee[0]);t.texStorage2D(i.TEXTURE_2D,Ae,Y,fe.width,fe.height)}for(let fe=0,le=Ee.length;fe<le;fe++)te=Ee[fe],F?ve&&t.texSubImage2D(i.TEXTURE_2D,fe,0,0,Z,j,te):t.texImage2D(i.TEXTURE_2D,fe,Y,Z,j,te);M.generateMipmaps=!1}else if(F){if(re){let fe=Be(C);t.texStorage2D(i.TEXTURE_2D,Ae,Y,fe.width,fe.height)}ve&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Z,j,C)}else t.texImage2D(i.TEXTURE_2D,0,Y,Z,j,C);m(M)&&d(O),J.__version=k.version,M.onUpdate&&M.onUpdate(M)}D.__version=M.version}function oe(D,M,I){if(M.image.length!==6)return;let O=Fe(D,M),H=M.source;t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+I);let k=n.get(H);if(H.version!==k.__version||O===!0){t.activeTexture(i.TEXTURE0+I);let J=nt.getPrimaries(nt.workingColorSpace),ee=M.colorSpace===Hn?null:nt.getPrimaries(M.colorSpace),de=M.colorSpace===Hn||J===ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,de);let pe=M.isCompressedTexture||M.image[0].isCompressedTexture,C=M.image[0]&&M.image[0].isDataTexture,Z=[];for(let le=0;le<6;le++)!pe&&!C?Z[le]=y(M.image[le],!0,s.maxCubemapSize):Z[le]=C?M.image[le].image:M.image[le],Z[le]=Ge(M,Z[le]);let j=Z[0],Y=r.convert(M.format,M.colorSpace),te=r.convert(M.type),Ee=x(M.internalFormat,Y,te,M.colorSpace),F=M.isVideoTexture!==!0,re=k.__version===void 0||O===!0,ve=H.dataReady,Ae=R(M,j);Me(i.TEXTURE_CUBE_MAP,M);let fe;if(pe){F&&re&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ae,Ee,j.width,j.height);for(let le=0;le<6;le++){fe=Z[le].mipmaps;for(let Ie=0;Ie<fe.length;Ie++){let ze=fe[Ie];M.format!==Xt?Y!==null?F?ve&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie,0,0,ze.width,ze.height,Y,ze.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie,Ee,ze.width,ze.height,0,ze.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?ve&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie,0,0,ze.width,ze.height,Y,te,ze.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie,Ee,ze.width,ze.height,0,Y,te,ze.data)}}}else{if(fe=M.mipmaps,F&&re){fe.length>0&&Ae++;let le=Be(Z[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ae,Ee,le.width,le.height)}for(let le=0;le<6;le++)if(C){F?ve&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,Z[le].width,Z[le].height,Y,te,Z[le].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,Ee,Z[le].width,Z[le].height,0,Y,te,Z[le].data);for(let Ie=0;Ie<fe.length;Ie++){let we=fe[Ie].image[le].image;F?ve&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie+1,0,0,we.width,we.height,Y,te,we.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie+1,Ee,we.width,we.height,0,Y,te,we.data)}}else{F?ve&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,Y,te,Z[le]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,Ee,Y,te,Z[le]);for(let Ie=0;Ie<fe.length;Ie++){let ze=fe[Ie];F?ve&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie+1,0,0,Y,te,ze.image[le]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+le,Ie+1,Ee,Y,te,ze.image[le])}}}m(M)&&d(i.TEXTURE_CUBE_MAP),k.__version=H.version,M.onUpdate&&M.onUpdate(M)}D.__version=M.version}function Ce(D,M,I,O,H,k){let J=r.convert(I.format,I.colorSpace),ee=r.convert(I.type),de=x(I.internalFormat,J,ee,I.colorSpace),pe=n.get(M),C=n.get(I);if(C.__renderTarget=M,!pe.__hasExternalTextures){let Z=Math.max(1,M.width>>k),j=Math.max(1,M.height>>k);H===i.TEXTURE_3D||H===i.TEXTURE_2D_ARRAY?t.texImage3D(H,k,de,Z,j,M.depth,0,J,ee,null):t.texImage2D(H,k,de,Z,j,0,J,ee,null)}t.bindFramebuffer(i.FRAMEBUFFER,D),he(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,O,H,C.__webglTexture,0,xe(M)):(H===i.TEXTURE_2D||H>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&H<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,O,H,C.__webglTexture,k),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Le(D,M,I){if(i.bindRenderbuffer(i.RENDERBUFFER,D),M.depthBuffer){let O=M.depthTexture,H=O&&O.isDepthTexture?O.type:null,k=g(M.stencilBuffer,H),J=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ee=xe(M);he(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ee,k,M.width,M.height):I?i.renderbufferStorageMultisample(i.RENDERBUFFER,ee,k,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,k,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,D)}else{let O=M.textures;for(let H=0;H<O.length;H++){let k=O[H],J=r.convert(k.format,k.colorSpace),ee=r.convert(k.type),de=x(k.internalFormat,J,ee,k.colorSpace),pe=xe(M);I&&he(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,pe,de,M.width,M.height):he(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,pe,de,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,de,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Pe(D,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,D),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let O=n.get(M.depthTexture);O.__renderTarget=M,(!O.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),z(M.depthTexture,0);let H=O.__webglTexture,k=xe(M);if(M.depthTexture.format===ts)he(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,H,0,k):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,H,0);else if(M.depthTexture.format===fs)he(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,H,0,k):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,H,0);else throw new Error("Unknown depthTexture format")}function Xe(D){let M=n.get(D),I=D.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==D.depthTexture){let O=D.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),O){let H=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,O.removeEventListener("dispose",H)};O.addEventListener("dispose",H),M.__depthDisposeCallback=H}M.__boundDepthTexture=O}if(D.depthTexture&&!M.__autoAllocateDepthBuffer){if(I)throw new Error("target.depthTexture not supported in Cube render targets");let O=D.texture.mipmaps;O&&O.length>0?Pe(M.__webglFramebuffer[0],D):Pe(M.__webglFramebuffer,D)}else if(I){M.__webglDepthbuffer=[];for(let O=0;O<6;O++)if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[O]),M.__webglDepthbuffer[O]===void 0)M.__webglDepthbuffer[O]=i.createRenderbuffer(),Le(M.__webglDepthbuffer[O],D,!1);else{let H=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,k=M.__webglDepthbuffer[O];i.bindRenderbuffer(i.RENDERBUFFER,k),i.framebufferRenderbuffer(i.FRAMEBUFFER,H,i.RENDERBUFFER,k)}}else{let O=D.texture.mipmaps;if(O&&O.length>0?t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),Le(M.__webglDepthbuffer,D,!1);else{let H=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,k=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,k),i.framebufferRenderbuffer(i.FRAMEBUFFER,H,i.RENDERBUFFER,k)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function et(D,M,I){let O=n.get(D);M!==void 0&&Ce(O.__webglFramebuffer,D,D.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),I!==void 0&&Xe(D)}function N(D){let M=D.texture,I=n.get(D),O=n.get(M);D.addEventListener("dispose",w);let H=D.textures,k=D.isWebGLCubeRenderTarget===!0,J=H.length>1;if(J||(O.__webglTexture===void 0&&(O.__webglTexture=i.createTexture()),O.__version=M.version,o.memory.textures++),k){I.__webglFramebuffer=[];for(let ee=0;ee<6;ee++)if(M.mipmaps&&M.mipmaps.length>0){I.__webglFramebuffer[ee]=[];for(let de=0;de<M.mipmaps.length;de++)I.__webglFramebuffer[ee][de]=i.createFramebuffer()}else I.__webglFramebuffer[ee]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){I.__webglFramebuffer=[];for(let ee=0;ee<M.mipmaps.length;ee++)I.__webglFramebuffer[ee]=i.createFramebuffer()}else I.__webglFramebuffer=i.createFramebuffer();if(J)for(let ee=0,de=H.length;ee<de;ee++){let pe=n.get(H[ee]);pe.__webglTexture===void 0&&(pe.__webglTexture=i.createTexture(),o.memory.textures++)}if(D.samples>0&&he(D)===!1){I.__webglMultisampledFramebuffer=i.createFramebuffer(),I.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let ee=0;ee<H.length;ee++){let de=H[ee];I.__webglColorRenderbuffer[ee]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,I.__webglColorRenderbuffer[ee]);let pe=r.convert(de.format,de.colorSpace),C=r.convert(de.type),Z=x(de.internalFormat,pe,C,de.colorSpace,D.isXRRenderTarget===!0),j=xe(D);i.renderbufferStorageMultisample(i.RENDERBUFFER,j,Z,D.width,D.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ee,i.RENDERBUFFER,I.__webglColorRenderbuffer[ee])}i.bindRenderbuffer(i.RENDERBUFFER,null),D.depthBuffer&&(I.__webglDepthRenderbuffer=i.createRenderbuffer(),Le(I.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(k){t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture),Me(i.TEXTURE_CUBE_MAP,M);for(let ee=0;ee<6;ee++)if(M.mipmaps&&M.mipmaps.length>0)for(let de=0;de<M.mipmaps.length;de++)Ce(I.__webglFramebuffer[ee][de],D,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ee,de);else Ce(I.__webglFramebuffer[ee],D,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0);m(M)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(J){for(let ee=0,de=H.length;ee<de;ee++){let pe=H[ee],C=n.get(pe),Z=i.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Z=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Z,C.__webglTexture),Me(Z,pe),Ce(I.__webglFramebuffer,D,pe,i.COLOR_ATTACHMENT0+ee,Z,0),m(pe)&&d(Z)}t.unbindTexture()}else{let ee=i.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ee=D.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ee,O.__webglTexture),Me(ee,M),M.mipmaps&&M.mipmaps.length>0)for(let de=0;de<M.mipmaps.length;de++)Ce(I.__webglFramebuffer[de],D,M,i.COLOR_ATTACHMENT0,ee,de);else Ce(I.__webglFramebuffer,D,M,i.COLOR_ATTACHMENT0,ee,0);m(M)&&d(ee),t.unbindTexture()}D.depthBuffer&&Xe(D)}function ce(D){let M=D.textures;for(let I=0,O=M.length;I<O;I++){let H=M[I];if(m(H)){let k=b(D),J=n.get(H).__webglTexture;t.bindTexture(k,J),d(k),t.unbindTexture()}}}let ae=[],ne=[];function se(D){if(D.samples>0){if(he(D)===!1){let M=D.textures,I=D.width,O=D.height,H=i.COLOR_BUFFER_BIT,k=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=n.get(D),ee=M.length>1;if(ee)for(let pe=0;pe<M.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,J.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,J.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,J.__webglMultisampledFramebuffer);let de=D.texture.mipmaps;de&&de.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,J.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,J.__webglFramebuffer);for(let pe=0;pe<M.length;pe++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(H|=i.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(H|=i.STENCIL_BUFFER_BIT)),ee){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,J.__webglColorRenderbuffer[pe]);let C=n.get(M[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,C,0)}i.blitFramebuffer(0,0,I,O,0,0,I,O,H,i.NEAREST),l===!0&&(ae.length=0,ne.length=0,ae.push(i.COLOR_ATTACHMENT0+pe),D.depthBuffer&&D.resolveDepthBuffer===!1&&(ae.push(k),ne.push(k),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ne)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ae))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ee)for(let pe=0;pe<M.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,J.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,J.__webglColorRenderbuffer[pe]);let C=n.get(M[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,J.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,C,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,J.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&l){let M=D.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function xe(D){return Math.min(s.maxSamples,D.samples)}function he(D){let M=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function ye(D){let M=o.render.frame;h.get(D)!==M&&(h.set(D,M),D.update())}function Ge(D,M){let I=D.colorSpace,O=D.format,H=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||I!==bi&&I!==Hn&&(nt.getTransfer(I)===lt?(O!==Xt||H!==Sn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",I)),M}function Be(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=L,this.setTexture2D=z,this.setTexture2DArray=V,this.setTexture3D=$,this.setTextureCube=G,this.rebindTextures=et,this.setupRenderTarget=N,this.updateRenderTargetMipmap=ce,this.updateMultisampleRenderTarget=se,this.setupDepthRenderbuffer=Xe,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=he}function L_(i,e){function t(n,s=Hn){let r,o=nt.getTransfer(s);if(n===Sn)return i.UNSIGNED_BYTE;if(n===ra)return i.UNSIGNED_SHORT_4_4_4_4;if(n===oa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===tc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===nc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ql)return i.BYTE;if(n===ec)return i.SHORT;if(n===hs)return i.UNSIGNED_SHORT;if(n===sa)return i.INT;if(n===li)return i.UNSIGNED_INT;if(n===sn)return i.FLOAT;if(n===us)return i.HALF_FLOAT;if(n===ic)return i.ALPHA;if(n===sc)return i.RGB;if(n===Xt)return i.RGBA;if(n===ts)return i.DEPTH_COMPONENT;if(n===fs)return i.DEPTH_STENCIL;if(n===aa)return i.RED;if(n===la)return i.RED_INTEGER;if(n===rc)return i.RG;if(n===ca)return i.RG_INTEGER;if(n===ha)return i.RGBA_INTEGER;if(n===Tr||n===Ar||n===Rr||n===Cr)if(o===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Tr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ar)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Cr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Tr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ar)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Rr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Cr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ua||n===da||n===fa||n===pa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ua)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===da)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===fa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===pa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ma||n===ga||n===_a)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ma||n===ga)return o===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===_a)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===xa||n===ya||n===va||n===Ma||n===Sa||n===ba||n===Ea||n===wa||n===Ta||n===Aa||n===Ra||n===Ca||n===Ia||n===Pa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===xa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ya)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===va)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ma)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Sa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ba)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ea)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===wa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ta)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Aa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ra)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ca)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ia)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Pa)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Da||n===La||n===Ua)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Da)return o===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===La)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ua)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Na||n===Fa||n===Oa||n===Ba)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Na)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Fa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Oa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ba)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ds?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var U_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,N_=`
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

}`,Tc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new rr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new vn({vertexShader:U_,fragmentShader:N_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ke(new Ti(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ac=class extends Nn{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,_=null,y=typeof XRWebGLBinding<"u",m=new Tc,d={},b=t.getContextAttributes(),x=null,g=null,R=[],T=[],w=new _e,P=null,S=new Rt;S.viewport=new rt;let v=new Rt;v.viewport=new rt;let E=[S,v],L=new Wo,B=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ie){let oe=R[ie];return oe===void 0&&(oe=new ss,R[ie]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(ie){let oe=R[ie];return oe===void 0&&(oe=new ss,R[ie]=oe),oe.getGripSpace()},this.getHand=function(ie){let oe=R[ie];return oe===void 0&&(oe=new ss,R[ie]=oe),oe.getHandSpace()};function z(ie){let oe=T.indexOf(ie.inputSource);if(oe===-1)return;let Ce=R[oe];Ce!==void 0&&(Ce.update(ie.inputSource,ie.frame,c||o),Ce.dispatchEvent({type:ie.type,data:ie.inputSource}))}function V(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",$);for(let ie=0;ie<R.length;ie++){let oe=T[ie];oe!==null&&(T[ie]=null,R[ie].disconnect(oe))}B=null,q=null,m.reset();for(let ie in d)delete d[ie];e.setRenderTarget(x),p=null,f=null,u=null,s=null,g=null,Ye.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ie){r=ie,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ie){a=ie,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(ie){c=ie},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&y&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(ie){if(s=ie,s!==null){if(x=e.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",V),s.addEventListener("inputsourceschange",$),b.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ce=null,Le=null,Pe=null;b.depth&&(Pe=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ce=b.stencil?fs:ts,Le=b.stencil?ds:li);let Xe={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Xe),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),g=new hn(f.textureWidth,f.textureHeight,{format:Xt,type:Sn,depthTexture:new sr(f.textureWidth,f.textureHeight,Le,void 0,void 0,void 0,void 0,void 0,void 0,Ce),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let Ce={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,Ce),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),g=new hn(p.framebufferWidth,p.framebufferHeight,{format:Xt,type:Sn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ye.setContext(s),Ye.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function $(ie){for(let oe=0;oe<ie.removed.length;oe++){let Ce=ie.removed[oe],Le=T.indexOf(Ce);Le>=0&&(T[Le]=null,R[Le].disconnect(Ce))}for(let oe=0;oe<ie.added.length;oe++){let Ce=ie.added[oe],Le=T.indexOf(Ce);if(Le===-1){for(let Xe=0;Xe<R.length;Xe++)if(Xe>=T.length){T.push(Ce),Le=Xe;break}else if(T[Xe]===null){T[Xe]=Ce,Le=Xe;break}if(Le===-1)break}let Pe=R[Le];Pe&&Pe.connect(Ce)}}let G=new U,ue=new U;function me(ie,oe,Ce){G.setFromMatrixPosition(oe.matrixWorld),ue.setFromMatrixPosition(Ce.matrixWorld);let Le=G.distanceTo(ue),Pe=oe.projectionMatrix.elements,Xe=Ce.projectionMatrix.elements,et=Pe[14]/(Pe[10]-1),N=Pe[14]/(Pe[10]+1),ce=(Pe[9]+1)/Pe[5],ae=(Pe[9]-1)/Pe[5],ne=(Pe[8]-1)/Pe[0],se=(Xe[8]+1)/Xe[0],xe=et*ne,he=et*se,ye=Le/(-ne+se),Ge=ye*-ne;if(oe.matrixWorld.decompose(ie.position,ie.quaternion,ie.scale),ie.translateX(Ge),ie.translateZ(ye),ie.matrixWorld.compose(ie.position,ie.quaternion,ie.scale),ie.matrixWorldInverse.copy(ie.matrixWorld).invert(),Pe[10]===-1)ie.projectionMatrix.copy(oe.projectionMatrix),ie.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{let Be=et+ye,D=N+ye,M=xe-Ge,I=he+(Le-Ge),O=ce*N/D*Be,H=ae*N/D*Be;ie.projectionMatrix.makePerspective(M,I,O,H,Be,D),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert()}}function Se(ie,oe){oe===null?ie.matrixWorld.copy(ie.matrix):ie.matrixWorld.multiplyMatrices(oe.matrixWorld,ie.matrix),ie.matrixWorldInverse.copy(ie.matrixWorld).invert()}this.updateCamera=function(ie){if(s===null)return;let oe=ie.near,Ce=ie.far;m.texture!==null&&(m.depthNear>0&&(oe=m.depthNear),m.depthFar>0&&(Ce=m.depthFar)),L.near=v.near=S.near=oe,L.far=v.far=S.far=Ce,(B!==L.near||q!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),B=L.near,q=L.far),L.layers.mask=ie.layers.mask|6,S.layers.mask=L.layers.mask&3,v.layers.mask=L.layers.mask&5;let Le=ie.parent,Pe=L.cameras;Se(L,Le);for(let Xe=0;Xe<Pe.length;Xe++)Se(Pe[Xe],Le);Pe.length===2?me(L,S,v):L.projectionMatrix.copy(S.projectionMatrix),Me(ie,L,Le)};function Me(ie,oe,Ce){Ce===null?ie.matrix.copy(oe.matrixWorld):(ie.matrix.copy(Ce.matrixWorld),ie.matrix.invert(),ie.matrix.multiply(oe.matrixWorld)),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.updateMatrixWorld(!0),ie.projectionMatrix.copy(oe.projectionMatrix),ie.projectionMatrixInverse.copy(oe.projectionMatrixInverse),ie.isPerspectiveCamera&&(ie.fov=yo*2*Math.atan(1/ie.projectionMatrix.elements[5]),ie.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(ie){l=ie,f!==null&&(f.fixedFoveation=ie),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=ie)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(ie){return d[ie]};let Fe=null;function Ze(ie,oe){if(h=oe.getViewerPose(c||o),_=oe,h!==null){let Ce=h.views;p!==null&&(e.setRenderTargetFramebuffer(g,p.framebuffer),e.setRenderTarget(g));let Le=!1;Ce.length!==L.cameras.length&&(L.cameras.length=0,Le=!0);for(let N=0;N<Ce.length;N++){let ce=Ce[N],ae=null;if(p!==null)ae=p.getViewport(ce);else{let se=u.getViewSubImage(f,ce);ae=se.viewport,N===0&&(e.setRenderTargetTextures(g,se.colorTexture,se.depthStencilTexture),e.setRenderTarget(g))}let ne=E[N];ne===void 0&&(ne=new Rt,ne.layers.enable(N),ne.viewport=new rt,E[N]=ne),ne.matrix.fromArray(ce.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(ce.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(ae.x,ae.y,ae.width,ae.height),N===0&&(L.matrix.copy(ne.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Le===!0&&L.cameras.push(ne)}let Pe=s.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){u=n.getBinding();let N=u.getDepthInformation(Ce[0]);N&&N.isValid&&N.texture&&m.init(N,s.renderState)}if(Pe&&Pe.includes("camera-access")&&y){e.state.unbindTexture(),u=n.getBinding();for(let N=0;N<Ce.length;N++){let ce=Ce[N].camera;if(ce){let ae=d[ce];ae||(ae=new rr,d[ce]=ae);let ne=u.getCameraImage(ce);ae.sourceTexture=ne}}}}for(let Ce=0;Ce<R.length;Ce++){let Le=T[Ce],Pe=R[Ce];Le!==null&&Pe!==void 0&&Pe.update(Le,oe,c||o)}Fe&&Fe(ie,oe),oe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:oe}),_=null}let Ye=new ju;Ye.setAnimationLoop(Ze),this.setAnimationLoop=function(ie){Fe=ie},this.dispose=function(){}}},Di=new un,F_=new Qe;function O_(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,cc(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,b,x,g){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,g)):d.isMeshMatcapMaterial?(r(m,d),_(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),y(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,b,x):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Mt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Mt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let b=e.get(d),x=b.envMap,g=b.envMapRotation;x&&(m.envMap.value=x,Di.copy(g),Di.x*=-1,Di.y*=-1,Di.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Di.y*=-1,Di.z*=-1),m.envMapRotation.value.setFromMatrix4(F_.makeRotationFromEuler(Di)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,b,x){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*b,m.scale.value=x*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,b){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Mt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){let b=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function B_(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,x){let g=x.program;n.uniformBlockBinding(b,g)}function c(b,x){let g=s[b.id];g===void 0&&(_(b),g=h(b),s[b.id]=g,b.addEventListener("dispose",m));let R=x.program;n.updateUBOMapping(b,R);let T=e.render.frame;r[b.id]!==T&&(f(b),r[b.id]=T)}function h(b){let x=u();b.__bindingPointIndex=x;let g=i.createBuffer(),R=b.__size,T=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,g),i.bufferData(i.UNIFORM_BUFFER,R,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,g),g}function u(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(b){let x=s[b.id],g=b.uniforms,R=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let T=0,w=g.length;T<w;T++){let P=Array.isArray(g[T])?g[T]:[g[T]];for(let S=0,v=P.length;S<v;S++){let E=P[S];if(p(E,T,S,R)===!0){let L=E.__offset,B=Array.isArray(E.value)?E.value:[E.value],q=0;for(let z=0;z<B.length;z++){let V=B[z],$=y(V);typeof V=="number"||typeof V=="boolean"?(E.__data[0]=V,i.bufferSubData(i.UNIFORM_BUFFER,L+q,E.__data)):V.isMatrix3?(E.__data[0]=V.elements[0],E.__data[1]=V.elements[1],E.__data[2]=V.elements[2],E.__data[3]=0,E.__data[4]=V.elements[3],E.__data[5]=V.elements[4],E.__data[6]=V.elements[5],E.__data[7]=0,E.__data[8]=V.elements[6],E.__data[9]=V.elements[7],E.__data[10]=V.elements[8],E.__data[11]=0):(V.toArray(E.__data,q),q+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,E.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(b,x,g,R){let T=b.value,w=x+"_"+g;if(R[w]===void 0)return typeof T=="number"||typeof T=="boolean"?R[w]=T:R[w]=T.clone(),!0;{let P=R[w];if(typeof T=="number"||typeof T=="boolean"){if(P!==T)return R[w]=T,!0}else if(P.equals(T)===!1)return P.copy(T),!0}return!1}function _(b){let x=b.uniforms,g=0,R=16;for(let w=0,P=x.length;w<P;w++){let S=Array.isArray(x[w])?x[w]:[x[w]];for(let v=0,E=S.length;v<E;v++){let L=S[v],B=Array.isArray(L.value)?L.value:[L.value];for(let q=0,z=B.length;q<z;q++){let V=B[q],$=y(V),G=g%R,ue=G%$.boundary,me=G+ue;g+=ue,me!==0&&R-me<$.storage&&(g+=R-me),L.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=g,g+=$.storage}}}let T=g%R;return T>0&&(g+=R-T),b.__size=g,b.__cache={},this}function y(b){let x={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(x.boundary=4,x.storage=4):b.isVector2?(x.boundary=8,x.storage=8):b.isVector3||b.isColor?(x.boundary=16,x.storage=12):b.isVector4?(x.boundary=16,x.storage=16):b.isMatrix3?(x.boundary=48,x.storage=48):b.isMatrix4?(x.boundary=64,x.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),x}function m(b){let x=b.target;x.removeEventListener("dispose",m);let g=o.indexOf(x.__bindingPointIndex);o.splice(g,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function d(){for(let b in s)i.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}var Pr=class{constructor(e={}){let{canvas:t=vu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let _=new Uint32Array(4),y=new Int32Array(4),m=null,d=null,b=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=kn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let g=this,R=!1;this._outputColorSpace=St;let T=0,w=0,P=null,S=-1,v=null,E=new rt,L=new rt,B=null,q=new He(0),z=0,V=t.width,$=t.height,G=1,ue=null,me=null,Se=new rt(0,0,V,$),Me=new rt(0,0,V,$),Fe=!1,Ze=new rs,Ye=!1,ie=!1,oe=new Qe,Ce=new U,Le=new rt,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Xe=!1;function et(){return P===null?G:1}let N=n;function ce(A,W){return t.getContext(A,W)}try{let A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",ve,!1),t.addEventListener("webglcontextrestored",Ae,!1),t.addEventListener("webglcontextcreationerror",fe,!1),N===null){let W="webgl2";if(N=ce(W,A),N===null)throw ce(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let ae,ne,se,xe,he,ye,Ge,Be,D,M,I,O,H,k,J,ee,de,pe,C,Z,j,Y,te,Ee;function F(){ae=new n0(N),ae.init(),Y=new L_(N,ae),ne=new Jg(N,ae,e,Y),se=new P_(N,ae),ne.reversedDepthBuffer&&f&&se.buffers.depth.setReversed(!0),xe=new r0(N),he=new x_,ye=new D_(N,ae,se,he,ne,Y,xe),Ge=new Kg(g),Be=new t0(g),D=new up(N),te=new Yg(N,D),M=new i0(N,D,xe,te),I=new a0(N,M,D,xe),C=new o0(N,ne,ye),ee=new $g(he),O=new __(g,Ge,Be,ae,ne,te,ee),H=new O_(g,he),k=new v_,J=new T_(ae),pe=new qg(g,Ge,Be,se,I,p,l),de=new C_(g,I,ne),Ee=new B_(N,xe,ne,se),Z=new Zg(N,ae,xe),j=new s0(N,ae,xe),xe.programs=O.programs,g.capabilities=ne,g.extensions=ae,g.properties=he,g.renderLists=k,g.shadowMap=de,g.state=se,g.info=xe}F();let re=new Ac(g,N);this.xr=re,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let A=ae.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=ae.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(A){A!==void 0&&(G=A,this.setSize(V,$,!1))},this.getSize=function(A){return A.set(V,$)},this.setSize=function(A,W,K=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=A,$=W,t.width=Math.floor(A*G),t.height=Math.floor(W*G),K===!0&&(t.style.width=A+"px",t.style.height=W+"px"),this.setViewport(0,0,A,W)},this.getDrawingBufferSize=function(A){return A.set(V*G,$*G).floor()},this.setDrawingBufferSize=function(A,W,K){V=A,$=W,G=K,t.width=Math.floor(A*K),t.height=Math.floor(W*K),this.setViewport(0,0,A,W)},this.getCurrentViewport=function(A){return A.copy(E)},this.getViewport=function(A){return A.copy(Se)},this.setViewport=function(A,W,K,Q){A.isVector4?Se.set(A.x,A.y,A.z,A.w):Se.set(A,W,K,Q),se.viewport(E.copy(Se).multiplyScalar(G).round())},this.getScissor=function(A){return A.copy(Me)},this.setScissor=function(A,W,K,Q){A.isVector4?Me.set(A.x,A.y,A.z,A.w):Me.set(A,W,K,Q),se.scissor(L.copy(Me).multiplyScalar(G).round())},this.getScissorTest=function(){return Fe},this.setScissorTest=function(A){se.setScissorTest(Fe=A)},this.setOpaqueSort=function(A){ue=A},this.setTransparentSort=function(A){me=A},this.getClearColor=function(A){return A.copy(pe.getClearColor())},this.setClearColor=function(){pe.setClearColor(...arguments)},this.getClearAlpha=function(){return pe.getClearAlpha()},this.setClearAlpha=function(){pe.setClearAlpha(...arguments)},this.clear=function(A=!0,W=!0,K=!0){let Q=0;if(A){let X=!1;if(P!==null){let ge=P.texture.format;X=ge===ha||ge===ca||ge===la}if(X){let ge=P.texture.type,Re=ge===Sn||ge===li||ge===hs||ge===ds||ge===ra||ge===oa,Ue=pe.getClearColor(),De=pe.getClearAlpha(),ke=Ue.r,We=Ue.g,Ne=Ue.b;Re?(_[0]=ke,_[1]=We,_[2]=Ne,_[3]=De,N.clearBufferuiv(N.COLOR,0,_)):(y[0]=ke,y[1]=We,y[2]=Ne,y[3]=De,N.clearBufferiv(N.COLOR,0,y))}else Q|=N.COLOR_BUFFER_BIT}W&&(Q|=N.DEPTH_BUFFER_BIT),K&&(Q|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(Q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ve,!1),t.removeEventListener("webglcontextrestored",Ae,!1),t.removeEventListener("webglcontextcreationerror",fe,!1),pe.dispose(),k.dispose(),J.dispose(),he.dispose(),Ge.dispose(),Be.dispose(),I.dispose(),te.dispose(),Ee.dispose(),O.dispose(),re.dispose(),re.removeEventListener("sessionstart",xt),re.removeEventListener("sessionend",bn),pn.stop()};function ve(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function Ae(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;let A=xe.autoReset,W=de.enabled,K=de.autoUpdate,Q=de.needsUpdate,X=de.type;F(),xe.autoReset=A,de.enabled=W,de.autoUpdate=K,de.needsUpdate=Q,de.type=X}function fe(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function le(A){let W=A.target;W.removeEventListener("dispose",le),Ie(W)}function Ie(A){ze(A),he.remove(A)}function ze(A){let W=he.get(A).programs;W!==void 0&&(W.forEach(function(K){O.releaseProgram(K)}),A.isShaderMaterial&&O.releaseShaderCache(A))}this.renderBufferDirect=function(A,W,K,Q,X,ge){W===null&&(W=Pe);let Re=X.isMesh&&X.matrixWorld.determinant()<0,Ue=jd(A,W,K,Q,X);se.setMaterial(Q,Re);let De=K.index,ke=1;if(Q.wireframe===!0){if(De=M.getWireframeAttribute(K),De===void 0)return;ke=2}let We=K.drawRange,Ne=K.attributes.position,tt=We.start*ke,ct=(We.start+We.count)*ke;ge!==null&&(tt=Math.max(tt,ge.start*ke),ct=Math.min(ct,(ge.start+ge.count)*ke)),De!==null?(tt=Math.max(tt,0),ct=Math.min(ct,De.count)):Ne!=null&&(tt=Math.max(tt,0),ct=Math.min(ct,Ne.count));let gt=ct-tt;if(gt<0||gt===1/0)return;te.setup(X,Q,Ue,K,De);let ut,ht=Z;if(De!==null&&(ut=D.get(De),ht=j,ht.setIndex(ut)),X.isMesh)Q.wireframe===!0?(se.setLineWidth(Q.wireframeLinewidth*et()),ht.setMode(N.LINES)):ht.setMode(N.TRIANGLES);else if(X.isLine){let Oe=Q.linewidth;Oe===void 0&&(Oe=1),se.setLineWidth(Oe*et()),X.isLineSegments?ht.setMode(N.LINES):X.isLineLoop?ht.setMode(N.LINE_LOOP):ht.setMode(N.LINE_STRIP)}else X.isPoints?ht.setMode(N.POINTS):X.isSprite&&ht.setMode(N.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)ns("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ht.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(ae.get("WEBGL_multi_draw"))ht.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Oe=X._multiDrawStarts,ft=X._multiDrawCounts,st=X._multiDrawCount,$t=De?D.get(De).bytesPerElement:1,ki=he.get(Q).currentProgram.getUniforms();for(let Kt=0;Kt<st;Kt++)ki.setValue(N,"_gl_DrawID",Kt),ht.render(Oe[Kt]/$t,ft[Kt])}else if(X.isInstancedMesh)ht.renderInstances(tt,gt,X.count);else if(K.isInstancedBufferGeometry){let Oe=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,ft=Math.min(K.instanceCount,Oe);ht.renderInstances(tt,gt,ft)}else ht.render(tt,gt)};function we(A,W,K){A.transparent===!0&&A.side===Pt&&A.forceSinglePass===!1?(A.side=Mt,A.needsUpdate=!0,kr(A,W,K),A.side=Vt,A.needsUpdate=!0,kr(A,W,K),A.side=Pt):kr(A,W,K)}this.compile=function(A,W,K=null){K===null&&(K=A),d=J.get(K),d.init(W),x.push(d),K.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(d.pushLight(X),X.castShadow&&d.pushShadow(X))}),A!==K&&A.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(d.pushLight(X),X.castShadow&&d.pushShadow(X))}),d.setupLights();let Q=new Set;return A.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let ge=X.material;if(ge)if(Array.isArray(ge))for(let Re=0;Re<ge.length;Re++){let Ue=ge[Re];we(Ue,K,X),Q.add(Ue)}else we(ge,K,X),Q.add(ge)}),d=x.pop(),Q},this.compileAsync=function(A,W,K=null){let Q=this.compile(A,W,K);return new Promise(X=>{function ge(){if(Q.forEach(function(Re){he.get(Re).currentProgram.isReady()&&Q.delete(Re)}),Q.size===0){X(A);return}setTimeout(ge,10)}ae.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let be=null;function Je(A){be&&be(A)}function xt(){pn.stop()}function bn(){pn.start()}let pn=new ju;pn.setAnimationLoop(Je),typeof self<"u"&&pn.setContext(self),this.setAnimationLoop=function(A){be=A,re.setAnimationLoop(A),A===null?pn.stop():pn.start()},re.addEventListener("sessionstart",xt),re.addEventListener("sessionend",bn),this.render=function(A,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(W),W=re.getCamera()),A.isScene===!0&&A.onBeforeRender(g,A,W,P),d=J.get(A,x.length),d.init(W),x.push(d),oe.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),Ze.setFromProjectionMatrix(oe,xn,W.reversedDepth),ie=this.localClippingEnabled,Ye=ee.init(this.clippingPlanes,ie),m=k.get(A,b.length),m.init(),b.push(m),re.enabled===!0&&re.isPresenting===!0){let ge=g.xr.getDepthSensingMesh();ge!==null&&rl(ge,W,-1/0,g.sortObjects)}rl(A,W,0,g.sortObjects),m.finish(),g.sortObjects===!0&&m.sort(ue,me),Xe=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,Xe&&pe.addToRenderList(m,A),this.info.render.frame++,Ye===!0&&ee.beginShadows();let K=d.state.shadowsArray;de.render(K,A,W),Ye===!0&&ee.endShadows(),this.info.autoReset===!0&&this.info.reset();let Q=m.opaque,X=m.transmissive;if(d.setupLights(),W.isArrayCamera){let ge=W.cameras;if(X.length>0)for(let Re=0,Ue=ge.length;Re<Ue;Re++){let De=ge[Re];th(Q,X,A,De)}Xe&&pe.render(A);for(let Re=0,Ue=ge.length;Re<Ue;Re++){let De=ge[Re];eh(m,A,De,De.viewport)}}else X.length>0&&th(Q,X,A,W),Xe&&pe.render(A),eh(m,A,W);P!==null&&w===0&&(ye.updateMultisampleRenderTarget(P),ye.updateRenderTargetMipmap(P)),A.isScene===!0&&A.onAfterRender(g,A,W),te.resetDefaultState(),S=-1,v=null,x.pop(),x.length>0?(d=x[x.length-1],Ye===!0&&ee.setGlobalState(g.clippingPlanes,d.state.camera)):d=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function rl(A,W,K,Q){if(A.visible===!1)return;if(A.layers.test(W.layers)){if(A.isGroup)K=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(W);else if(A.isLight)d.pushLight(A),A.castShadow&&d.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||Ze.intersectsSprite(A)){Q&&Le.setFromMatrixPosition(A.matrixWorld).applyMatrix4(oe);let Re=I.update(A),Ue=A.material;Ue.visible&&m.push(A,Re,Ue,K,Le.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||Ze.intersectsObject(A))){let Re=I.update(A),Ue=A.material;if(Q&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Le.copy(A.boundingSphere.center)):(Re.boundingSphere===null&&Re.computeBoundingSphere(),Le.copy(Re.boundingSphere.center)),Le.applyMatrix4(A.matrixWorld).applyMatrix4(oe)),Array.isArray(Ue)){let De=Re.groups;for(let ke=0,We=De.length;ke<We;ke++){let Ne=De[ke],tt=Ue[Ne.materialIndex];tt&&tt.visible&&m.push(A,Re,tt,K,Le.z,Ne)}}else Ue.visible&&m.push(A,Re,Ue,K,Le.z,null)}}let ge=A.children;for(let Re=0,Ue=ge.length;Re<Ue;Re++)rl(ge[Re],W,K,Q)}function eh(A,W,K,Q){let X=A.opaque,ge=A.transmissive,Re=A.transparent;d.setupLightsView(K),Ye===!0&&ee.setGlobalState(g.clippingPlanes,K),Q&&se.viewport(E.copy(Q)),X.length>0&&zr(X,W,K),ge.length>0&&zr(ge,W,K),Re.length>0&&zr(Re,W,K),se.buffers.depth.setTest(!0),se.buffers.depth.setMask(!0),se.buffers.color.setMask(!0),se.setPolygonOffset(!1)}function th(A,W,K,Q){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[Q.id]===void 0&&(d.state.transmissionRenderTarget[Q.id]=new hn(1,1,{generateMipmaps:!0,type:ae.has("EXT_color_buffer_half_float")||ae.has("EXT_color_buffer_float")?us:Sn,minFilter:ai,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace}));let ge=d.state.transmissionRenderTarget[Q.id],Re=Q.viewport||E;ge.setSize(Re.z*g.transmissionResolutionScale,Re.w*g.transmissionResolutionScale);let Ue=g.getRenderTarget(),De=g.getActiveCubeFace(),ke=g.getActiveMipmapLevel();g.setRenderTarget(ge),g.getClearColor(q),z=g.getClearAlpha(),z<1&&g.setClearColor(16777215,.5),g.clear(),Xe&&pe.render(K);let We=g.toneMapping;g.toneMapping=kn;let Ne=Q.viewport;if(Q.viewport!==void 0&&(Q.viewport=void 0),d.setupLightsView(Q),Ye===!0&&ee.setGlobalState(g.clippingPlanes,Q),zr(A,K,Q),ye.updateMultisampleRenderTarget(ge),ye.updateRenderTargetMipmap(ge),ae.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let ct=0,gt=W.length;ct<gt;ct++){let ut=W[ct],ht=ut.object,Oe=ut.geometry,ft=ut.material,st=ut.group;if(ft.side===Pt&&ht.layers.test(Q.layers)){let $t=ft.side;ft.side=Mt,ft.needsUpdate=!0,nh(ht,K,Q,Oe,ft,st),ft.side=$t,ft.needsUpdate=!0,tt=!0}}tt===!0&&(ye.updateMultisampleRenderTarget(ge),ye.updateRenderTargetMipmap(ge))}g.setRenderTarget(Ue,De,ke),g.setClearColor(q,z),Ne!==void 0&&(Q.viewport=Ne),g.toneMapping=We}function zr(A,W,K){let Q=W.isScene===!0?W.overrideMaterial:null;for(let X=0,ge=A.length;X<ge;X++){let Re=A[X],Ue=Re.object,De=Re.geometry,ke=Re.group,We=Re.material;We.allowOverride===!0&&Q!==null&&(We=Q),Ue.layers.test(K.layers)&&nh(Ue,W,K,De,We,ke)}}function nh(A,W,K,Q,X,ge){A.onBeforeRender(g,W,K,Q,X,ge),A.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),X.onBeforeRender(g,W,K,Q,A,ge),X.transparent===!0&&X.side===Pt&&X.forceSinglePass===!1?(X.side=Mt,X.needsUpdate=!0,g.renderBufferDirect(K,W,Q,X,A,ge),X.side=Vt,X.needsUpdate=!0,g.renderBufferDirect(K,W,Q,X,A,ge),X.side=Pt):g.renderBufferDirect(K,W,Q,X,A,ge),A.onAfterRender(g,W,K,Q,X,ge)}function kr(A,W,K){W.isScene!==!0&&(W=Pe);let Q=he.get(A),X=d.state.lights,ge=d.state.shadowsArray,Re=X.state.version,Ue=O.getParameters(A,X.state,ge,W,K),De=O.getProgramCacheKey(Ue),ke=Q.programs;Q.environment=A.isMeshStandardMaterial?W.environment:null,Q.fog=W.fog,Q.envMap=(A.isMeshStandardMaterial?Be:Ge).get(A.envMap||Q.environment),Q.envMapRotation=Q.environment!==null&&A.envMap===null?W.environmentRotation:A.envMapRotation,ke===void 0&&(A.addEventListener("dispose",le),ke=new Map,Q.programs=ke);let We=ke.get(De);if(We!==void 0){if(Q.currentProgram===We&&Q.lightsStateVersion===Re)return sh(A,Ue),We}else Ue.uniforms=O.getUniforms(A),A.onBeforeCompile(Ue,g),We=O.acquireProgram(Ue,De),ke.set(De,We),Q.uniforms=Ue.uniforms;let Ne=Q.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Ne.clippingPlanes=ee.uniform),sh(A,Ue),Q.needsLights=ef(A),Q.lightsStateVersion=Re,Q.needsLights&&(Ne.ambientLightColor.value=X.state.ambient,Ne.lightProbe.value=X.state.probe,Ne.directionalLights.value=X.state.directional,Ne.directionalLightShadows.value=X.state.directionalShadow,Ne.spotLights.value=X.state.spot,Ne.spotLightShadows.value=X.state.spotShadow,Ne.rectAreaLights.value=X.state.rectArea,Ne.ltc_1.value=X.state.rectAreaLTC1,Ne.ltc_2.value=X.state.rectAreaLTC2,Ne.pointLights.value=X.state.point,Ne.pointLightShadows.value=X.state.pointShadow,Ne.hemisphereLights.value=X.state.hemi,Ne.directionalShadowMap.value=X.state.directionalShadowMap,Ne.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Ne.spotShadowMap.value=X.state.spotShadowMap,Ne.spotLightMatrix.value=X.state.spotLightMatrix,Ne.spotLightMap.value=X.state.spotLightMap,Ne.pointShadowMap.value=X.state.pointShadowMap,Ne.pointShadowMatrix.value=X.state.pointShadowMatrix),Q.currentProgram=We,Q.uniformsList=null,We}function ih(A){if(A.uniformsList===null){let W=A.currentProgram.getUniforms();A.uniformsList=ys.seqWithValue(W.seq,A.uniforms)}return A.uniformsList}function sh(A,W){let K=he.get(A);K.outputColorSpace=W.outputColorSpace,K.batching=W.batching,K.batchingColor=W.batchingColor,K.instancing=W.instancing,K.instancingColor=W.instancingColor,K.instancingMorph=W.instancingMorph,K.skinning=W.skinning,K.morphTargets=W.morphTargets,K.morphNormals=W.morphNormals,K.morphColors=W.morphColors,K.morphTargetsCount=W.morphTargetsCount,K.numClippingPlanes=W.numClippingPlanes,K.numIntersection=W.numClipIntersection,K.vertexAlphas=W.vertexAlphas,K.vertexTangents=W.vertexTangents,K.toneMapping=W.toneMapping}function jd(A,W,K,Q,X){W.isScene!==!0&&(W=Pe),ye.resetTextureUnits();let ge=W.fog,Re=Q.isMeshStandardMaterial?W.environment:null,Ue=P===null?g.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:bi,De=(Q.isMeshStandardMaterial?Be:Ge).get(Q.envMap||Re),ke=Q.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,We=!!K.attributes.tangent&&(!!Q.normalMap||Q.anisotropy>0),Ne=!!K.morphAttributes.position,tt=!!K.morphAttributes.normal,ct=!!K.morphAttributes.color,gt=kn;Q.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(gt=g.toneMapping);let ut=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,ht=ut!==void 0?ut.length:0,Oe=he.get(Q),ft=d.state.lights;if(Ye===!0&&(ie===!0||A!==v)){let Ft=A===v&&Q.id===S;ee.setState(Q,A,Ft)}let st=!1;Q.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==ft.state.version||Oe.outputColorSpace!==Ue||X.isBatchedMesh&&Oe.batching===!1||!X.isBatchedMesh&&Oe.batching===!0||X.isBatchedMesh&&Oe.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Oe.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Oe.instancing===!1||!X.isInstancedMesh&&Oe.instancing===!0||X.isSkinnedMesh&&Oe.skinning===!1||!X.isSkinnedMesh&&Oe.skinning===!0||X.isInstancedMesh&&Oe.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Oe.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Oe.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Oe.instancingMorph===!1&&X.morphTexture!==null||Oe.envMap!==De||Q.fog===!0&&Oe.fog!==ge||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==ee.numPlanes||Oe.numIntersection!==ee.numIntersection)||Oe.vertexAlphas!==ke||Oe.vertexTangents!==We||Oe.morphTargets!==Ne||Oe.morphNormals!==tt||Oe.morphColors!==ct||Oe.toneMapping!==gt||Oe.morphTargetsCount!==ht)&&(st=!0):(st=!0,Oe.__version=Q.version);let $t=Oe.currentProgram;st===!0&&($t=kr(Q,W,X));let ki=!1,Kt=!1,Ds=!1,pt=$t.getUniforms(),an=Oe.uniforms;if(se.useProgram($t.program)&&(ki=!0,Kt=!0,Ds=!0),Q.id!==S&&(S=Q.id,Kt=!0),ki||v!==A){se.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),pt.setValue(N,"projectionMatrix",A.projectionMatrix),pt.setValue(N,"viewMatrix",A.matrixWorldInverse);let kt=pt.map.cameraPosition;kt!==void 0&&kt.setValue(N,Ce.setFromMatrixPosition(A.matrixWorld)),ne.logarithmicDepthBuffer&&pt.setValue(N,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(Q.isMeshPhongMaterial||Q.isMeshToonMaterial||Q.isMeshLambertMaterial||Q.isMeshBasicMaterial||Q.isMeshStandardMaterial||Q.isShaderMaterial)&&pt.setValue(N,"isOrthographic",A.isOrthographicCamera===!0),v!==A&&(v=A,Kt=!0,Ds=!0)}if(X.isSkinnedMesh){pt.setOptional(N,X,"bindMatrix"),pt.setOptional(N,X,"bindMatrixInverse");let Ft=X.skeleton;Ft&&(Ft.boneTexture===null&&Ft.computeBoneTexture(),pt.setValue(N,"boneTexture",Ft.boneTexture,ye))}X.isBatchedMesh&&(pt.setOptional(N,X,"batchingTexture"),pt.setValue(N,"batchingTexture",X._matricesTexture,ye),pt.setOptional(N,X,"batchingIdTexture"),pt.setValue(N,"batchingIdTexture",X._indirectTexture,ye),pt.setOptional(N,X,"batchingColorTexture"),X._colorsTexture!==null&&pt.setValue(N,"batchingColorTexture",X._colorsTexture,ye));let ln=K.morphAttributes;if((ln.position!==void 0||ln.normal!==void 0||ln.color!==void 0)&&C.update(X,K,$t),(Kt||Oe.receiveShadow!==X.receiveShadow)&&(Oe.receiveShadow=X.receiveShadow,pt.setValue(N,"receiveShadow",X.receiveShadow)),Q.isMeshGouraudMaterial&&Q.envMap!==null&&(an.envMap.value=De,an.flipEnvMap.value=De.isCubeTexture&&De.isRenderTargetTexture===!1?-1:1),Q.isMeshStandardMaterial&&Q.envMap===null&&W.environment!==null&&(an.envMapIntensity.value=W.environmentIntensity),Kt&&(pt.setValue(N,"toneMappingExposure",g.toneMappingExposure),Oe.needsLights&&Qd(an,Ds),ge&&Q.fog===!0&&H.refreshFogUniforms(an,ge),H.refreshMaterialUniforms(an,Q,G,$,d.state.transmissionRenderTarget[A.id]),ys.upload(N,ih(Oe),an,ye)),Q.isShaderMaterial&&Q.uniformsNeedUpdate===!0&&(ys.upload(N,ih(Oe),an,ye),Q.uniformsNeedUpdate=!1),Q.isSpriteMaterial&&pt.setValue(N,"center",X.center),pt.setValue(N,"modelViewMatrix",X.modelViewMatrix),pt.setValue(N,"normalMatrix",X.normalMatrix),pt.setValue(N,"modelMatrix",X.matrixWorld),Q.isShaderMaterial||Q.isRawShaderMaterial){let Ft=Q.uniformsGroups;for(let kt=0,ol=Ft.length;kt<ol;kt++){let pi=Ft[kt];Ee.update(pi,$t),Ee.bind(pi,$t)}}return $t}function Qd(A,W){A.ambientLightColor.needsUpdate=W,A.lightProbe.needsUpdate=W,A.directionalLights.needsUpdate=W,A.directionalLightShadows.needsUpdate=W,A.pointLights.needsUpdate=W,A.pointLightShadows.needsUpdate=W,A.spotLights.needsUpdate=W,A.spotLightShadows.needsUpdate=W,A.rectAreaLights.needsUpdate=W,A.hemisphereLights.needsUpdate=W}function ef(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(A,W,K){let Q=he.get(A);Q.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,Q.__autoAllocateDepthBuffer===!1&&(Q.__useRenderToTexture=!1),he.get(A.texture).__webglTexture=W,he.get(A.depthTexture).__webglTexture=Q.__autoAllocateDepthBuffer?void 0:K,Q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,W){let K=he.get(A);K.__webglFramebuffer=W,K.__useDefaultFramebuffer=W===void 0};let tf=N.createFramebuffer();this.setRenderTarget=function(A,W=0,K=0){P=A,T=W,w=K;let Q=!0,X=null,ge=!1,Re=!1;if(A){let De=he.get(A);if(De.__useDefaultFramebuffer!==void 0)se.bindFramebuffer(N.FRAMEBUFFER,null),Q=!1;else if(De.__webglFramebuffer===void 0)ye.setupRenderTarget(A);else if(De.__hasExternalTextures)ye.rebindTextures(A,he.get(A.texture).__webglTexture,he.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let Ne=A.depthTexture;if(De.__boundDepthTexture!==Ne){if(Ne!==null&&he.has(Ne)&&(A.width!==Ne.image.width||A.height!==Ne.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ye.setupDepthRenderbuffer(A)}}let ke=A.texture;(ke.isData3DTexture||ke.isDataArrayTexture||ke.isCompressedArrayTexture)&&(Re=!0);let We=he.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(We[W])?X=We[W][K]:X=We[W],ge=!0):A.samples>0&&ye.useMultisampledRTT(A)===!1?X=he.get(A).__webglMultisampledFramebuffer:Array.isArray(We)?X=We[K]:X=We,E.copy(A.viewport),L.copy(A.scissor),B=A.scissorTest}else E.copy(Se).multiplyScalar(G).floor(),L.copy(Me).multiplyScalar(G).floor(),B=Fe;if(K!==0&&(X=tf),se.bindFramebuffer(N.FRAMEBUFFER,X)&&Q&&se.drawBuffers(A,X),se.viewport(E),se.scissor(L),se.setScissorTest(B),ge){let De=he.get(A.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+W,De.__webglTexture,K)}else if(Re){let De=W;for(let ke=0;ke<A.textures.length;ke++){let We=he.get(A.textures[ke]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+ke,We.__webglTexture,K,De)}}else if(A!==null&&K!==0){let De=he.get(A.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,De.__webglTexture,K)}S=-1},this.readRenderTargetPixels=function(A,W,K,Q,X,ge,Re,Ue=0){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let De=he.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Re!==void 0&&(De=De[Re]),De){se.bindFramebuffer(N.FRAMEBUFFER,De);try{let ke=A.textures[Ue],We=ke.format,Ne=ke.type;if(!ne.textureFormatReadable(We)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ne.textureTypeReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=A.width-Q&&K>=0&&K<=A.height-X&&(A.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+Ue),N.readPixels(W,K,Q,X,Y.convert(We),Y.convert(Ne),ge))}finally{let ke=P!==null?he.get(P).__webglFramebuffer:null;se.bindFramebuffer(N.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(A,W,K,Q,X,ge,Re,Ue=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let De=he.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Re!==void 0&&(De=De[Re]),De)if(W>=0&&W<=A.width-Q&&K>=0&&K<=A.height-X){se.bindFramebuffer(N.FRAMEBUFFER,De);let ke=A.textures[Ue],We=ke.format,Ne=ke.type;if(!ne.textureFormatReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ne.textureTypeReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let tt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,tt),N.bufferData(N.PIXEL_PACK_BUFFER,ge.byteLength,N.STREAM_READ),A.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+Ue),N.readPixels(W,K,Q,X,Y.convert(We),Y.convert(Ne),0);let ct=P!==null?he.get(P).__webglFramebuffer:null;se.bindFramebuffer(N.FRAMEBUFFER,ct);let gt=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Mu(N,gt,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,tt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ge),N.deleteBuffer(tt),N.deleteSync(gt),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,W=null,K=0){let Q=Math.pow(2,-K),X=Math.floor(A.image.width*Q),ge=Math.floor(A.image.height*Q),Re=W!==null?W.x:0,Ue=W!==null?W.y:0;ye.setTexture2D(A,0),N.copyTexSubImage2D(N.TEXTURE_2D,K,0,0,Re,Ue,X,ge),se.unbindTexture()};let nf=N.createFramebuffer(),sf=N.createFramebuffer();this.copyTextureToTexture=function(A,W,K=null,Q=null,X=0,ge=null){ge===null&&(X!==0?(ns("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ge=X,X=0):ge=0);let Re,Ue,De,ke,We,Ne,tt,ct,gt,ut=A.isCompressedTexture?A.mipmaps[ge]:A.image;if(K!==null)Re=K.max.x-K.min.x,Ue=K.max.y-K.min.y,De=K.isBox3?K.max.z-K.min.z:1,ke=K.min.x,We=K.min.y,Ne=K.isBox3?K.min.z:0;else{let ln=Math.pow(2,-X);Re=Math.floor(ut.width*ln),Ue=Math.floor(ut.height*ln),A.isDataArrayTexture?De=ut.depth:A.isData3DTexture?De=Math.floor(ut.depth*ln):De=1,ke=0,We=0,Ne=0}Q!==null?(tt=Q.x,ct=Q.y,gt=Q.z):(tt=0,ct=0,gt=0);let ht=Y.convert(W.format),Oe=Y.convert(W.type),ft;W.isData3DTexture?(ye.setTexture3D(W,0),ft=N.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(ye.setTexture2DArray(W,0),ft=N.TEXTURE_2D_ARRAY):(ye.setTexture2D(W,0),ft=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,W.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,W.unpackAlignment);let st=N.getParameter(N.UNPACK_ROW_LENGTH),$t=N.getParameter(N.UNPACK_IMAGE_HEIGHT),ki=N.getParameter(N.UNPACK_SKIP_PIXELS),Kt=N.getParameter(N.UNPACK_SKIP_ROWS),Ds=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,ut.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ut.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,ke),N.pixelStorei(N.UNPACK_SKIP_ROWS,We),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ne);let pt=A.isDataArrayTexture||A.isData3DTexture,an=W.isDataArrayTexture||W.isData3DTexture;if(A.isDepthTexture){let ln=he.get(A),Ft=he.get(W),kt=he.get(ln.__renderTarget),ol=he.get(Ft.__renderTarget);se.bindFramebuffer(N.READ_FRAMEBUFFER,kt.__webglFramebuffer),se.bindFramebuffer(N.DRAW_FRAMEBUFFER,ol.__webglFramebuffer);for(let pi=0;pi<De;pi++)pt&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,he.get(A).__webglTexture,X,Ne+pi),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,he.get(W).__webglTexture,ge,gt+pi)),N.blitFramebuffer(ke,We,Re,Ue,tt,ct,Re,Ue,N.DEPTH_BUFFER_BIT,N.NEAREST);se.bindFramebuffer(N.READ_FRAMEBUFFER,null),se.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(X!==0||A.isRenderTargetTexture||he.has(A)){let ln=he.get(A),Ft=he.get(W);se.bindFramebuffer(N.READ_FRAMEBUFFER,nf),se.bindFramebuffer(N.DRAW_FRAMEBUFFER,sf);for(let kt=0;kt<De;kt++)pt?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,ln.__webglTexture,X,Ne+kt):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,ln.__webglTexture,X),an?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ft.__webglTexture,ge,gt+kt):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Ft.__webglTexture,ge),X!==0?N.blitFramebuffer(ke,We,Re,Ue,tt,ct,Re,Ue,N.COLOR_BUFFER_BIT,N.NEAREST):an?N.copyTexSubImage3D(ft,ge,tt,ct,gt+kt,ke,We,Re,Ue):N.copyTexSubImage2D(ft,ge,tt,ct,ke,We,Re,Ue);se.bindFramebuffer(N.READ_FRAMEBUFFER,null),se.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else an?A.isDataTexture||A.isData3DTexture?N.texSubImage3D(ft,ge,tt,ct,gt,Re,Ue,De,ht,Oe,ut.data):W.isCompressedArrayTexture?N.compressedTexSubImage3D(ft,ge,tt,ct,gt,Re,Ue,De,ht,ut.data):N.texSubImage3D(ft,ge,tt,ct,gt,Re,Ue,De,ht,Oe,ut):A.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,ge,tt,ct,Re,Ue,ht,Oe,ut.data):A.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,ge,tt,ct,ut.width,ut.height,ht,ut.data):N.texSubImage2D(N.TEXTURE_2D,ge,tt,ct,Re,Ue,ht,Oe,ut);N.pixelStorei(N.UNPACK_ROW_LENGTH,st),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,$t),N.pixelStorei(N.UNPACK_SKIP_PIXELS,ki),N.pixelStorei(N.UNPACK_SKIP_ROWS,Kt),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ds),ge===0&&W.generateMipmaps&&N.generateMipmap(ft),se.unbindTexture()},this.initRenderTarget=function(A){he.get(A).__webglFramebuffer===void 0&&ye.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?ye.setTextureCube(A,0):A.isData3DTexture?ye.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?ye.setTexture2DArray(A,0):ye.setTexture2D(A,0),se.unbindTexture()},this.resetState=function(){T=0,w=0,P=null,se.reset(),te.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}};var Dr=new U;function fn(i,e,t,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Dr.copy(e),Dr[n]=0,Dr.normalize();let c=.5*o/(o+a),h=1-Dr.angleTo(i)/l;return Math.sign(Dr[t])===1?h*c:a/(o+a)+c+c*(1-h)}var Vn=class i extends dn{constructor(e=1,t=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new U,c=new U,h=new U(e,t,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,f=this.attributes.normal.array,p=this.attributes.uv.array,_=u.length/6,y=new U,m=.5/o;for(let d=0,b=0;d<u.length;d+=3,b+=2)switch(l.fromArray(u,d),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[d+0]=h.x*Math.sign(l.x)+c.x*r,u[d+1]=h.y*Math.sign(l.y)+c.y*r,u[d+2]=h.z*Math.sign(l.z)+c.z*r,f[d+0]=c.x,f[d+1]=c.y,f[d+2]=c.z,Math.floor(d/_)){case 0:y.set(1,0,0),p[b+0]=fn(y,c,"z","y",r,n),p[b+1]=1-fn(y,c,"y","z",r,t);break;case 1:y.set(-1,0,0),p[b+0]=1-fn(y,c,"z","y",r,n),p[b+1]=1-fn(y,c,"y","z",r,t);break;case 2:y.set(0,1,0),p[b+0]=1-fn(y,c,"x","z",r,e),p[b+1]=fn(y,c,"z","x",r,n);break;case 3:y.set(0,-1,0),p[b+0]=1-fn(y,c,"x","z",r,e),p[b+1]=1-fn(y,c,"z","x",r,n);break;case 4:y.set(0,0,1),p[b+0]=1-fn(y,c,"x","y",r,e),p[b+1]=1-fn(y,c,"y","x",r,t);break;case 5:y.set(0,0,-1),p[b+0]=fn(y,c,"x","y",r,e),p[b+1]=1-fn(y,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var Wa=class extends Fn{constructor(){super();let e=new dn;e.deleteAttribute("uv");let t=new Bt({side:Mt}),n=new Bt,s=new vr(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Ke(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new tr(e,n,6),a=new vt;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new Ke(e,Ss(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Ke(e,Ss(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Ke(e,Ss(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Ke(e,Ss(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let f=new Ke(e,Ss(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);let p=new Ke(e,Ss(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Ss(i){return new _r({color:0,emissive:16777215,emissiveIntensity:i})}var rn=i=>[i[0]/100,(186-i[1])/100,i[2]/100],Cc=i=>[i[0],-i[1],i[2]],ci=i=>new U(...i);function Ic(i){return new Ct().setFromRotationMatrix(new Qe().makeBasis(ci(Cc(i.x)),ci(Cc(i.y)),ci(Cc(i.z))))}function Xa(i,e){let t=new it,n=[];t.setAttribute("position",new Ve(new Float32Array((i+1)*(e+1)*3),3));for(let s=0;s<i;s++)for(let r=0;r<e;r++){let o=s*(e+1)+r,a=o+1,l=o+e+1;n.push(o,a,l,a,l+1,l)}return t.setIndex(n),t}function qa(i,e,t=rn,n=!1){let s=e[0].length,r=i.attributes.position,o=0;for(let h of e)for(let u=0;u<=s;u++)r.setXYZ(o++,...t(h[u%s]));if(r.needsUpdate=!0,n){i.boundingSphere=null,i.boundingBox=null;return}i.computeVertexNormals();let a=i.attributes.normal,l=new U,c=new U;for(let h=0;h<e.length;h++){let u=h*(s+1),f=u+s;l.fromBufferAttribute(a,u).add(c.fromBufferAttribute(a,f)),l.lengthSq()>1e-12&&(l.normalize(),a.setXYZ(u,l.x,l.y,l.z),a.setXYZ(f,l.x,l.y,l.z))}a.needsUpdate=!0,i.boundingSphere=null,i.boundingBox=null}var id=i=>i.reduce((e,t)=>[e[0]+t[0]/i.length,e[1]+t[1]/i.length,e[2]+t[2]/i.length],[0,0,0]);function z_(i){let e=[],n=new Vn(i.palm.size[0]*.01,i.palm.size[1]*.01,i.palm.size[2]*.01,2,.012);n.translate(...i.palm.c.map(s=>s*.01)),e.push(n);for(let s of[...i.fingers,i.thumb]){let r=s.pts.map(l=>ci(l.map(c=>c*.01))),o=new Tn(new Mn(r),Math.max(6,r.length*3),s.r*.01,7,!1);e.push(o);let a=new It(s.r*.01,8,6);a.translate(...s.pts.at(-1).map(l=>l*.01)),e.push(a)}return e}var Pc=i=>[i[0]/100,i[1]/100,i[2]/100];function k_(i){let e=[];for(let t of i.toes){let n=t.pts.map(o=>ci(Pc(o)));e.push(new Tn(new Mn(n),Math.max(6,n.length*3),t.r/100,8,!1));let s=new It(t.r/100,8,6);s.translate(...Pc(t.pts[0])),e.push(s);let r=new It(t.r/100,10,8);r.translate(...Pc(t.pts.at(-1))),e.push(r)}return e}function sd(i,e,{skin:t,joint:n,sole:s,mesh:r}){let o=(...R)=>{let T=r(...R);return T.receiveShadow=!1,T.frustumCulled=!1,T},a=e.body,l={},c=new ot;c.name="mannequin",i.add(c);let h=a.torso.length+1;l.torso={mesh:o(c,Xa(h,a.torso[0].length),t,"torso")};for(let[R,T]of Object.entries(a.limbs))l[R]={mesh:o(c,Xa(T.length-1,T[0].length),t,R)};l.neck={mesh:o(c,Xa(a.neck.length-1,a.neck[0].length),t,"neck")};let u=new ot;u.name="head",c.add(u);{let R=a.head.mesh,T=new it;T.setAttribute("position",new Ve(new Float32Array(R.pts.flatMap(w=>w.map(P=>P/100))),3)),T.setAttribute("normal",new Ve(new Float32Array(R.nrm.flat()),3)),T.setIndex(R.idx),T.computeBoundingSphere(),T.computeBoundingBox(),o(u,T,t,"skull");for(let w of Object.values(a.head.ears)){let P=o(u,new It(1,16,12),t,"ear");P.position.set(...w.c.map(S=>S/100)),P.quaternion.setFromRotationMatrix(new Qe().makeBasis(ci(w.ax[0]),ci(w.ax[1]),ci(w.ax[2]))),P.scale.set(...w.r.map(S=>S/100))}}l.head={mesh:u};for(let R of a.caps)l["cap-"+R.key]={mesh:o(c,new It(1,16,12),t,"cap-"+R.key)};let f=new Map;for(let R of["L","R"]){let T=new ot;T.name="hand"+R,c.add(T),l["hand"+R]={mesh:T,key:null};let w=e.body.feet[R],P=o(c,Xa(w.rows.length-1,w.rows[0].length),t,"foot-rear"+R),S=new ot;S.name="foot-toes"+R,c.add(S);for(let v of k_(w.shape))o(S,v,t,"toe"+R);l["foot-rear"+R]={mesh:P},l["foot-toes"+R]={mesh:S}}let p=new ot;p.name="joint-dots",i.add(p);let _=new en({color:"#e2f1ff",depthTest:!1,toneMapped:!1}),y=new en({color:"#0e1520",depthTest:!1,toneMapped:!1}),m=new It(.021,10,8),d=new It(.031,10,8);for(let R of["L","R"])for(let T of["sh","el","wr","hip","kn","an"]){let w=o(p,m,_,T+R),P=new Ke(d,y);P.name="dot-ring",P.renderOrder=10,w.renderOrder=11,w.castShadow=w.receiveShadow=!1,w.add(P),l["dot"+T+R]={mesh:w}}function b(R,T){let w=l["hand"+R];if(w.key!==T.key){w.mesh.traverse(P=>{P.isMesh&&!f.has(P.geometry.uuid)&&P.geometry.dispose()}),w.mesh.clear();for(let P of z_(T.shape))o(w.mesh,P,t,"hand-part"+R);w.key=T.key}w.mesh.position.fromArray(rn(T.frame.o)),w.mesh.quaternion.copy(Ic(T.frame))}function x(R,T,w=!1){let P=R.body,S=R.pose,v=P.torso,E=id(v.at(-1)),L=id(v[0]),B=(z,V)=>z.map(($,G)=>[2*$[0]-V[G][0],2*$[1]-V[G][1],2*$[2]-V[G][2]]),q=l.torso.mesh.geometry;qa(q,[B(v[0],v[1]),...v,B(v.at(-1),v.at(-2))],rn,w);{let z=q.attributes.position,V=v[0].length,$=(v.length+1)*(V+1);for(let G=0;G<=V;G++)z.setXYZ(G,...rn(L)),z.setXYZ($+G,...rn(E));z.needsUpdate=!0,q.boundingSphere=null,q.boundingBox=null}for(let[z,V]of Object.entries(P.limbs))qa(l[z].mesh.geometry,V,rn,w);qa(l.neck.mesh.geometry,P.neck,rn,w),u.position.fromArray(rn(P.head.c)),u.quaternion.copy(Ic({x:P.head.axes[0],y:P.head.axes[1],z:P.head.axes[2]}));for(let z of P.caps){let V=l["cap-"+z.key].mesh;V.position.fromArray(rn(z.c)),V.scale.setScalar(z.r/100)}for(let z of["L","R"]){b(z,P.hands[z]),qa(l["foot-rear"+z].mesh.geometry,P.feet[z].rows,rn,w);{let V=P.feet[z].toes,$=l["foot-toes"+z].mesh;$.position.fromArray(rn(V.o)),$.quaternion.copy(Ic(V))}for(let V of["sh","el","wr","hip","kn","an"])l["dot"+V+z].mesh.position.fromArray(rn(S[V+z]))}p.visible=!!T.joints}function g(R,T){let w=R.pose;for(let P of["L","R"])for(let S of["sh","el","wr","hip","kn","an"])l["dot"+S+P].mesh.position.fromArray(rn(w[S+P]));p.visible=!!T.joints}return{group:c,parts:l,apply:x,dots:g}}var H_=186,Dc=6,V_=`attribute float skelBone;
uniform highp sampler2D skelBones;`,G_=`void main() {
 int skelRow=int(skelBone+.5);
 vec4 skelA0=texelFetch(skelBones,ivec2(0,skelRow),0),skelA1=texelFetch(skelBones,ivec2(1,skelRow),0),skelA2=texelFetch(skelBones,ivec2(2,skelRow),0);`,W_=`#include <beginnormal_vertex>
 {vec3 skelN0=texelFetch(skelBones,ivec2(3,skelRow),0).xyz,skelN1=texelFetch(skelBones,ivec2(4,skelRow),0).xyz,skelN2=texelFetch(skelBones,ivec2(5,skelRow),0).xyz;
  objectNormal=vec3(dot(skelN0,objectNormal),dot(skelN1,objectNormal),dot(skelN2,objectNormal));}`,X_=`#include <begin_vertex>
 transformed=vec3(dot(skelA0.xyz,transformed)+skelA0.w,dot(skelA1.xyz,transformed)+skelA1.w,dot(skelA2.xyz,transformed)+skelA2.w);`;function rd(i,e,t){return i.onBeforeCompile=n=>{n.uniforms.skelBones={value:e},n.vertexShader=V_+`
`+n.vertexShader.replace("void main() {",G_).replace("#include <beginnormal_vertex>",W_).replace("#include <begin_vertex>",X_)},i.customProgramCacheKey=()=>t,i}function q_(i){let e=0,t=0;for(let u of i)e+=u.pos.length/3,t+=u.idx.length;let n=new Float32Array(e*3),s=new Float32Array(e*3),r=new Uint16Array(e),o=e>65535?new Uint32Array(t):new Uint16Array(t),a=[],l=0,c=0;i.forEach((u,f)=>{let p=new it;p.setAttribute("position",new Ve(u.pos,3)),p.setIndex(new Ve(u.idx,1)),p.computeVertexNormals(),p.computeBoundingBox(),n.set(u.pos,l*3),s.set(p.attributes.normal.array,l*3),r.fill(f,l,l+u.pos.length/3);for(let m=0;m<u.idx.length;m++)o[c++]=u.idx[m]+l;let{min:_,max:y}=p.boundingBox;a.push([_.x,_.y,_.z,y.x,y.y,y.z]),l+=u.pos.length/3,p.dispose()});let h=new it;return h.setAttribute("position",new Ve(n,3)),h.setAttribute("normal",new Ve(s,3)),h.setAttribute("skelBone",new Ve(r,1)),h.setIndex(new Ve(o,1)),{geometry:h,boxes:a}}function od(i){let e=new ot;e.name="skeleton",e.visible=!1,i.add(e);let t=null,n=null,s=null,r=null,o=null,a=[],l=[],c=null,h=null;function u(g){y();let R=g.bones.length;t=new ii(new Float32Array(Dc*4*R),Dc,R,Xt,sn),t.minFilter=t.magFilter=Ut,t.generateMipmaps=!1,t.name="skeleton-bones",n=rd(new Bt({color:"#ece2cb",roughness:.62,metalness:0}),t,"skeleton-bones"),n.name="skeleton-bones",s=rd(new si({depthPacking:ps}),t,"skeleton-bones-depth"),s.name="skeleton-bones-depth";let T=q_(g.bones);l=T.boxes,a=g.bones.map(w=>w.name+(w.side||"")),r=new Ke(T.geometry,n),r.name="bones",r.matrixAutoUpdate=!1,r.castShadow=!0,r.receiveShadow=!1,r.frustumCulled=!1,r.customDepthMaterial=s,Object.defineProperty(r.userData,"boundsPoints",{get:f,enumerable:!1,configurable:!0}),e.add(r),c=new Float32Array(R*12),h=null,o=g}function f(){return h||(h=[],l.forEach((g,R)=>{let T=R*12;for(let w of[g[0],g[3]])for(let P of[g[1],g[4]])for(let S of[g[2],g[5]])h.push(new U(c[T]*w+c[T+1]*P+c[T+2]*S+c[T+3],c[T+4]*w+c[T+5]*P+c[T+6]*S+c[T+7],c[T+8]*w+c[T+9]*P+c[T+10]*S+c[T+11]))}),h)}function p(g,R,T,w=globalThis.Skeleton.frames(R,T,g.bones)){o!==g&&u(g);let P=t.image.data,S=a.length;for(let v=0;v<S;v++){let E=v*12,L=c;L[E]=w[E]/100,L[E+1]=w[E+1]/100,L[E+2]=w[E+2]/100,L[E+3]=w[E+3]/100,L[E+4]=-w[E+4]/100,L[E+5]=-w[E+5]/100,L[E+6]=-w[E+6]/100,L[E+7]=(H_-w[E+7])/100,L[E+8]=w[E+8]/100,L[E+9]=w[E+9]/100,L[E+10]=w[E+10]/100,L[E+11]=w[E+11]/100;let B=v*Dc*4;P.set(L.subarray(E,E+12),B);let q=L[E],z=L[E+1],V=L[E+2],$=L[E+4],G=L[E+5],ue=L[E+6],me=L[E+8],Se=L[E+9],Me=L[E+10],Fe=G*Me-ue*Se,Ze=ue*me-$*Me,Ye=$*Se-G*me,ie=q*Fe+z*Ze+V*Ye,oe=ie?1/ie:0;P[B+12]=Fe*oe,P[B+13]=Ze*oe,P[B+14]=Ye*oe,P[B+15]=0,P[B+16]=(V*Se-z*Me)*oe,P[B+17]=(q*Me-V*me)*oe,P[B+18]=(z*me-q*Se)*oe,P[B+19]=0,P[B+20]=(z*ue-V*G)*oe,P[B+21]=(V*$-q*ue)*oe,P[B+22]=(q*G-z*$)*oe,P[B+23]=0}t.needsUpdate=!0,h=null,e.visible=!0}function _(){e.visible=!1}function y(){r&&(r.geometry.dispose(),e.remove(r)),t?.dispose(),n?.dispose(),s?.dispose(),r=t=n=s=null}function m(){y(),o=null,a=[],l=[],c=null,h=null}function d(){t?.dispose()}function b(g){let R=a.indexOf(g);if(R<0||!c)return null;let T=R*12,w=c;return new Qe().set(w[T],w[T+1],w[T+2],w[T+3],w[T+4],w[T+5],w[T+6],w[T+7],w[T+8],w[T+9],w[T+10],w[T+11],0,0,0,1)}let x={group:e,update:p,hide:_,dispose:m,disposeTexture:d,matrixOf:b,get names(){return a.slice()},get meshes(){return r?[r]:[]},get material(){return n}};return e.userData.layer=x,x}var Y_=1.5,Lr="#b98c86",cd={pecm1:"pec_clavicular",pecm2:"pec_sternal",pecm3:"pec_costal",trilong:"tri_long",trilat:"tri_lateral",trimed:"tri_medial",biclong:"bi_long",bicshort:"bi_short",recfem:"quad_rectus",vaslat:"quad_lateral",vasmed:"quad_medial",vasint:"quad_deep",bflh:"ham_lateral",semimem:"ham_medial",semiten:"ham_medial",gasmed:"calf_medial",gaslat:"calf_lateral",soleus:"soleus",glmax:"glute_max",glmed:"glute_lateral",glmin:"glute_lateral",trapsup:"trap_upper",trapmid:"trap_mid"};Object.assign(cd,{trapinf:"trap_lower",levscap:"lev_scap",bfsh:"ham_short",eo:"obl_ext",io:"obl_int",pecmin:"pec_minor",supsp:"cuff_sup",infsp:"cuff_ext",tmin:"cuff_ext",subsc:"cuff_int",brd:"brachiorad",fcr:"forearm_flex",fcu:"forearm_flex",pl:"forearm_flex",fds:"forearm_flex",fdp:"forearm_flex",fpl:"forearm_flex",pt:"forearm_flex",pq:"forearm_flex",ecrl:"forearm_ext",ecrb:"forearm_ext",ecu:"forearm_ext",edc:"forearm_ext",edm:"forearm_ext",eip:"forearm_ext",epl:"forearm_ext",epb:"forearm_ext",apl:"forearm_ext",sup:"forearm_ext"});var ad=new WeakMap;function Z_(i){if(!i)return new Map;let e=ad.get(i);if(e)return e;e=new Map;for(let[t,n]of Object.entries(i))e.has(n.parent)||e.set(n.parent,[]),e.get(n.parent).push(t);return ad.set(i,e),e}function J_(i,e,t,n){let s=i.group||[];if(!s.length)return Lr;let r=l=>{let c=cd[i.part];return c&&t?.regions?.[c]?.parent===l?c:l},o=t?.selected&&t.selected!=="all"?t.selected:null;if(o&&!s.some(l=>r(l)===o||l===o))return Lr;if(t?.phases&&t.values){let l=t.sideValues?.[i.side]||t.values,c=Z_(t.regions),h=0,u=!1;for(let f of s){if(t.values[f]===void 0)continue;u=!0;let p=r(f),_=p!==f||t.regions?.[f]?l[p]:void 0,y=_===void 0?(c.get(f)||[]).map(m=>l[m]).filter(Number.isFinite):[];h=Math.max(h,_??(y.length?Math.max(...y):l[f]??t.values[f]))}return u?n(h):Lr}let a=Math.max(0,...s.map(l=>e?.[l]||0));return a>=1?n(1):a>0?n(.55):Lr}var qt={muscles:null,only:null,frames:null,pos:null,nor:null},$_=(i,e)=>{if(!i||!e||i.length!==e.length)return!1;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return!1;return!0},Es=64,ld=2,K_=2/Es+1e-9,Lc=16<<20,Fi=new Map,bs=0,hd=0;function j_(i,e){let t=Fi.get(i);return t&&t.data!==e&&(bs-=t.bytes,Fi.delete(i),t=null),t?Fi.delete(i):t={data:e,bins:new Array(Es+1).fill(null),bytes:0},Fi.set(i,t),t}function Q_(i,e,t,n){for(let[s,r]of Fi){if(bs+n.byteLength<=Lc||r===i)break;Fi.delete(s),bs-=r.bytes}bs+n.byteLength>Lc||i.bins[e]||(i.bins[e]={t,tape:n},i.bytes+=n.byteLength,bs+=n.byteLength)}function ex(i,e,t){let n=Math.min(Es,Math.floor(e*Es)),s=null,r=null;for(let a=Math.max(0,n-ld);a<=Math.min(Es,n+ld);a++){let l=i.bins[a];if(l){if(Math.abs(l.t-e)<1e-7)return{memo:{a:l.tape,b:l.tape,w:0}};l.t<e?(!s||l.t>s.t)&&(s=l):(!r||l.t<r.t)&&(r=l)}}if(s&&r&&r.t-s.t<=K_)return{memo:{a:s.tape,b:r.tape,w:(e-s.t)/(r.t-s.t)}};if(i.bins[n])return null;let o=new Int16Array(t);return{memo:{rec:o},e:i,b:n,rec:o}}function ud(){return{bytes:bs,figures:Fi.size,limit:Lc,phases:Es,misses:hd}}var tx=186,nx=new Set(["trapmid","trapinf"]),ix=.02;function sx(i){return i.onBeforeCompile=e=>{e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
attribute float layer;`).replace("#include <project_vertex>",`#include <project_vertex>
 if(layer>0.){vec3 toCam=isOrthographic?vec3(0.,0.,1.):normalize(-mvPosition.xyz);mvPosition.xyz+=toCam*layer*`+ix.toFixed(3)+";gl_Position=projectionMatrix*mvPosition;}")},i.customProgramCacheKey=()=>"muscle-layer",i}function rx(i,e,t){let n=globalThis.Muscles,s=new Map;return(i.sheets||[]).forEach((r,o)=>{if(t&&!t.test(r.name))return;let a=e.bones.findIndex(l=>l.name===r.bone[0]&&(l.side||"")===(r.bone[1]||""));if(a<0)throw Error("muscles: no bone "+r.bone.join(" "));s.has(a)||s.set(a,[]),s.get(a).push([o,n.sheetMesh(r)])}),[...s].map(([r,o])=>{let a=o.reduce((_,[,y])=>_+y.n,0),l=new Float32Array(a*3),c=new Float32Array(a*3),h=[],u=[],f=0;for(let[_,y]of o){l.set(y.pos,f*3),c.set(y.nor,f*3);for(let m of y.idx)h.push(m+f);for(let m=0;m<y.idx.length/3;m++)u.push(_);f+=y.n}let p=new it;return p.setAttribute("position",new Ve(l,3)),p.setAttribute("normal",new Ve(c,3)),p.setIndex(a>65535?new ni(h,1):new ti(h,1)),{bone:r,geo:p,owner:u}})}function dd(i){let e=new ot;e.name="muscles",e.visible=!1,i.add(e);let t=null,n=null,s=null,r=null,o=null,a=null,l=null,c=null,h=0,u=[],f=null,p=null;function _(S,v){for(let E of u)e.remove(E.mesh),E.geo.dispose();p||(p=new Bt({color:Lr,roughness:.55,metalness:0})),u=rx(S.muscles,S.skeleton,v).map(E=>{let L=new Ke(E.geo,p);return L.name="muscle-sheets",L.matrixAutoUpdate=!1,L.frustumCulled=!1,L.castShadow=!1,L.receiveShadow=!1,e.add(L),{...E,mesh:L}})}function y(S){for(let v of u){let E=v.bone*12,L=B=>S[E+B];v.mesh.matrix.set(L(0)/100,L(1)/100,L(2)/100,L(3)/100,-L(4)/100,-L(5)/100,-L(6)/100,(tx-L(7))/100,L(8)/100,L(9)/100,L(10)/100,L(11)/100,0,0,0,1),v.mesh.matrixWorldNeedsUpdate=!0}}let m=new He;function d(){let S=globalThis.Muscles;h=S.SIDES,l=S.ringStarts(r);let v=l[r.length]*h,E=[];c=[];for(let B=0;B<r.length;B++)for(let q=l[B];q<l[B+1]-1;q++)for(let z=0;z<h;z++){let V=q*h+z,$=q*h+(z+1)%h,G=V+h,ue=$+h;E.push(V,$,G,$,ue,G),c.push(B,B)}n?.dispose(),n=new it,n.setAttribute("position",new Ve(new Float32Array(v*3),3).setUsage(ms)),n.setAttribute("normal",new Ve(new Float32Array(v*3),3).setUsage(ms)),n.setAttribute("color",new Ve(new Float32Array(v*3),3));let L=new Float32Array(v);for(let B=0;B<r.length;B++)nx.has(r[B].part)&&L.fill(1,l[B]*h,l[B+1]*h);n.setAttribute("layer",new Ve(L,1)),n.setIndex(v>65535?new ni(E,1):new ti(E,1)),s||(s=sx(new Bt({roughness:.55,metalness:0,vertexColors:!0}))),t&&e.remove(t),t=new Ke(n,s),t.name="muscle-bodies",t.frustumCulled=!1,t.castShadow=!1,t.receiveShadow=!1,e.add(t),a=new Array(r.length).fill(null)}function b(S,v,E){let L=n.attributes.color.array,B=!1;r.forEach((q,z)=>{let V=J_(q,S,v,E);if(a[z]!==V){a[z]=V,B=!0,m.set(V);for(let $=l[z]*h;$<l[z+1]*h;$++)L[$*3]=m.r,L[$*3+1]=m.g,L[$*3+2]=m.b}}),B&&(n.attributes.color.needsUpdate=!0)}function x(S,v,E,L=null,B=null){let q=globalThis.Muscles,z=S.muscles;(o!==z||r?.skel!==S.skeleton)&&(r=q.bind(z,S.skeleton),r.skel=S.skeleton,o=z,d()),b(S.level,L,E);let V=n.attributes.position.array,$=n.attributes.normal.array,G=S.only||null,ue=[z,S.skeleton,G?G.source:""];if((!f||f.some((Me,Fe)=>Me!==ue[Fe]))&&(_(S,G),f=ue),y(v),qt.muscles===z&&!G&&!qt.only&&qt.pos?.length===V.length&&$_(qt.frames,v)){V.set(qt.pos),$.set(qt.nor),g();return}let me=B&&B.key&&r.tapeN&&B.t>=0&&B.t<=1?ex(j_(B.key,r),B.t,r.tapeN):null;B&&(!me||me.rec)&&hd++,q.surfaceAll(r,q.layoutDrawn(r,v,Y_),v,V,$,l,me?me.memo:null),me&&me.rec&&Q_(me.e,me.b,B.t,me.rec);for(let Me=0;Me<V.length;Me+=3)V[Me]/=100,V[Me+1]=(186-V[Me+1])/100,V[Me+2]/=100,$[Me+1]=-$[Me+1];if(G)for(let Me=0;Me<r.length;Me++)G.test(r[Me].name)||V.fill(0,l[Me]*h*3,l[Me+1]*h*3);let Se=(Me,Fe)=>Me&&Me.length===Fe.length?(Me.set(Fe),Me):Float32Array.from(Fe);qt.muscles=z,qt.only=G,qt.frames=Se(qt.frames,v),qt.pos=Se(qt.pos,V),qt.nor=Se(qt.nor,$),g()}function g(){n.attributes.position.needsUpdate=!0,n.attributes.normal.needsUpdate=!0,n.boundingSphere=null,n.boundingBox=null,e.visible=!0}function R(){e.visible=!1}function T(){t&&e.remove(t),n?.dispose(),s?.dispose(),t=n=s=null,r=null,o=null;for(let S of u)e.remove(S.mesh),S.geo.dispose();u=[],f=null,p?.dispose(),p=null}function w(S){if(!e.visible||!t)return-1;n.computeBoundingSphere();let v=S.intersectObject(t,!1)[0];return v?c[v.faceIndex]:-1}function P(S){if(!e.visible||!t)return null;n.computeBoundingSphere();let v=null,E=S.intersectObject(t,!1)[0];E&&(v={muscle:c[E.faceIndex],distance:E.distance});for(let L of u){L.geo.boundingSphere||L.geo.computeBoundingSphere();let B=S.intersectObject(L.mesh,!1)[0];B&&(!v||B.distance<v.distance)&&(v={sheet:L.owner[B.faceIndex],distance:B.distance})}return v}return{group:e,update:x,hide:R,dispose:T,pick:w,pickAny:P,get mesh(){return t},get sheets(){return u.map(S=>S.mesh)}}}var Ya=186,ox=37,md=4,ax=24,lx={ao:[.85,.35],relief:[.6,6],roughness:.72},cx=()=>({...lx,...globalThis.ANNY_LOOK||{}});function hx(i,e,t){let n=Math.atan2(i,t),s=97.5-Math.cos(n),r=i>=0?1:-1,o=Math.atan2((i-8.8*r)*r,t),a=85+1.5*Math.cos(o)+8*Math.sin(o);return Math.min(s-e,e-a)}var ux=new Set(["pelvis","lumbar","thorax","thL","thR"]);function dx(i,e,t,n,s){if(!(n>0))return;let r=i.attributes.normal.array,o=Array.from({length:t},()=>new Set);for(let l=0;l<e.length;l+=3){let c=e[l],h=e[l+1],u=e[l+2];o[c].add(h).add(u),o[h].add(c).add(u),o[u].add(c).add(h)}let a=Float32Array.from(r);for(let l=0;l<s;l++){let c=new Float32Array(a.length);for(let h=0;h<t;h++){let u=a[h*3],f=a[h*3+1],p=a[h*3+2];for(let y of o[h])u+=a[y*3],f+=a[y*3+1],p+=a[y*3+2];let _=Math.hypot(u,f,p)||1;c[h*3]=u/_,c[h*3+1]=f/_,c[h*3+2]=p/_}a=c}for(let l=0;l<t;l++){let c=r[l*3]+n*(r[l*3]-a[l*3]),h=r[l*3+1]+n*(r[l*3+1]-a[l*3+1]),u=r[l*3+2]+n*(r[l*3+2]-a[l*3+2]),f=Math.hypot(c,h,u)||1;r[l*3]=c/f,r[l*3+1]=h/f,r[l*3+2]=u/f}i.attributes.normal.needsUpdate=!0}function fx(i,e,t){let n=o=>{let a=new Float32Array(o.length);for(let l=0;l<e.length;l+=3){let c=e[l]*3,h=e[l+1]*3,u=e[l+2]*3,f=o[u]-o[h],p=o[u+1]-o[h+1],_=o[u+2]-o[h+2],y=o[c]-o[h],m=o[c+1]-o[h+1],d=o[c+2]-o[h+2],b=p*d-_*m,x=_*y-f*d,g=f*m-p*y;a[c]+=b,a[c+1]+=x,a[c+2]+=g,a[h]+=b,a[h+1]+=x,a[h+2]+=g,a[u]+=b,a[u+1]+=x,a[u+2]+=g}for(let l=0;l<a.length;l+=3){let c=Math.hypot(a[l],a[l+1],a[l+2])||1;a[l]/=c,a[l+1]/=c,a[l+2]/=c}return a},s=n(i),r=new Float32Array(i.length);return t.map(o=>{for(let l=0;l<r.length;l++)r[l]=i[l]+o.array[l];let a=n(r);for(let l=0;l<a.length;l++)a[l]-=s[l];return new Ve(a,3)})}var fd=`
uniform vec4 annyDQ[ANNY_FRAMES*2];
#define ANNY_FLOOR ${Ya.toFixed(1)}
#define ANNY_SUP ${md}
attribute vec4 annyIndex;
attribute vec4 annyWeight;
/* \u0440\u0430\u043C\u043A\u0430 \u0437\u0430\u043A\u0440\u0443\u0442\u043A\u0438 \u043F\u043B\u0435\u0447\u0430 (AnnySkin.slotDQ): [\u044F\u0447\u0435\u0439\u043A\u0430 \u043F\u043B\u0435\u0447\u0430 (0\u20133), \u0435\u0433\u043E \u0440\u0430\u043C\u043A\u0430 \u0437\u0430\u043A\u0440\u0443\u0442\u043A\u0438, \u0434\u043E\u043B\u044F \u0437\u0430\u043A\u0440\u0443\u0442\u043A\u0438 \u0432 \u044F\u0447\u0435\u0439\u043A\u0435]; \u0434\u043E\u043B\u044F 0 \u2014 \u043D\u0435\u0442.
   \u0421\u043C\u0435\u0448\u0430\u043D\u043D\u044B\u0439 \u043A\u0432\u0430\u0442\u0435\u0440\u043D\u0438\u043E\u043D \u044F\u0447\u0435\u0439\u043A\u0438 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043E\u0434\u0438\u043D \u0440\u0430\u0437 \u043D\u0430 \u0432\u0435\u0440\u0448\u0438\u043D\u0443 \u0434\u043E \u0446\u0438\u043A\u043B\u0430 (\u0432 \u0446\u0438\u043A\u043B\u0435 \u2014 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430): \u0432\u0435\u0442\u0432\u043B\u0435\u043D\u0438\u0435 \u0438 \u0432\u044B\u0431\u043E\u0440\u043A\u0438 \u0438\u0437
   uniform-\u043C\u0430\u0441\u0441\u0438\u0432\u0430 \u0432 \u043A\u0430\u0436\u0434\u043E\u0439 \u044F\u0447\u0435\u0439\u043A\u0435 \u0441\u0442\u043E\u0438\u043B\u0438 \u0440\u0430\u0441\u0442\u0440\u0443 SwiftShader \u043E\u043A\u043E\u043B\u043E 10 % */
attribute vec3 annyRoll;
int annyRollSlot(ivec4 ix,out vec4 mr,out vec4 md){
 mr=vec4(0.);md=vec4(0.);if(annyRoll.z<=0.)return -1;
 int s=int(annyRoll.x+.5),i=ix[s],j=int(annyRoll.y+.5);vec4 ur=annyDQ[i*2],ud=annyDQ[i*2+1],rr=annyDQ[j*2],rd=annyDQ[j*2+1];
 float sg=dot(ur,rr)<0.?-1.:1.;mr=mix(ur,sg*rr,annyRoll.z);md=mix(ud,sg*rd,annyRoll.z);return s;
}
void annyBlend(out vec4 r,out vec4 d){
 ivec4 ix=ivec4(annyIndex+.5);
 vec4 mr,md;int rs=annyRollSlot(ix,mr,md);
 vec4 r0=rs==0?mr:annyDQ[ix.x*2];r=vec4(0.);d=vec4(0.);
 for(int k=0;k<4;k++){
  float w=annyWeight[k];if(w<=0.)continue;
  vec4 qr=annyDQ[ix[k]*2],qd=annyDQ[ix[k]*2+1];
  if(k==rs){qr=mr;qd=md;}
  if(dot(qr,r0)<0.)w=-w;
  r+=w*qr;d+=w*qd;
 }
 float l=length(r);r/=l;d/=l;
}
vec3 annyRotate(vec4 q,vec3 p){return p+2.*cross(q.xyz,cross(q.xyz,p)+q.w*p);}
vec3 annyMove(vec4 r,vec4 d,vec3 p){return annyRotate(r,p)+2.*(r.w*d.xyz-d.w*r.xyz+cross(r.xyz,d.xyz));}
/* \u043E\u043F\u043E\u0440\u044B (AnnySkin.supports, supportMove \u2014 \u0442\u043E\u0442 \u0436\u0435 \u0440\u0430\u0441\u0447\u0451\u0442): \u043A\u043E\u0436\u0430 \u0447\u0430\u0441\u0442\u0438 \u0442\u0435\u043B\u0430 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0430 \u0443 \u043E\u043F\u043E\u0440\u044B \u043B\u043E\u0436\u0438\u0442\u0441\u044F \u043D\u0430 \u043D\u0435\u0451. \u041D\u0430 \u043E\u043F\u043E\u0440\u0443 6 vec4:
   \u0446\u0435\u043D\u0442\u0440 \u0438 \u0442\u0438\u043F (0 \u2014 \u043A\u043E\u0440\u043E\u0431\u043A\u0430 \u0441\u043E \u0441\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u0438\u0435\u043C, 1 \u2014 \u0446\u0438\u043B\u0438\u043D\u0434\u0440 \u043F\u043E \u043E\u0441\u0438 y), \u0442\u0440\u0438 \u043E\u0441\u0438 \u0441 \u043F\u043E\u043B\u0443\u0440\u0430\u0437\u043C\u0435\u0440\u0430\u043C\u0438, [\u0441\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u0438\u0435, a, \u043F\u0435\u0440\u0435\u0445\u043E\u0434, \u0441\u0438\u043B\u0430],
   [\u0431\u0438\u0442\u044B \u0440\u0430\u043C\u043E\u043A \u0447\u0430\u0441\u0442\u0438 \u0442\u0435\u043B\u0430 (\u043F\u043E 19 \u0432 \u0447\u0438\u0441\u043B\u0435), \u043F\u044F\u0442\u043A\u0430: 1000 + \u043F\u043E\u0440\u043E\u0433 z \u0432 \u0441\u0442\u043E\u0439\u043A\u0435 (0 \u2014 \u0432\u0441\u044F \u0447\u0430\u0441\u0442\u044C \u0442\u0435\u043B\u0430)]; st \u2014 \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u0432 \u0441\u0442\u043E\u0439\u043A\u0435 */
uniform vec4 annySup[ANNY_SUP*6];
uniform int annySupN;
float annySupBit(vec4 m,int i){int c=i/19;float v=c==0?m.x:c==1?m.y:m.z;return float((int(v+.5)>>(i-c*19))&1);}
vec3 annySupport(vec3 p,vec3 st){
 if(annySupN==0)return p;
 ivec4 ix=ivec4(annyIndex+.5);
 for(int k=0;k<ANNY_SUP;k++){
  if(k>=annySupN)break;
  vec4 c0=annySup[k*6],X=annySup[k*6+1],Y=annySup[k*6+2],Z=annySup[k*6+3],pr=annySup[k*6+4],mk=annySup[k*6+5];
  float m=0.;for(int j=0;j<4;j++){float w=annyWeight[j];if(w>0.)m+=w*annySupBit(mk,ix[j]);}
  if(mk.w>0.){float u=clamp((mk.w-1000.+1.-st.z)*.5,0.,1.);m*=u*u*(3.-2.*u);}
  if(m<=0.)continue;
  vec3 d=p-c0.xyz,l=vec3(dot(d,X.xyz),dot(d,Y.xyz),dot(d,Z.xyz)),g;float h;
  if(c0.w<.5){vec3 q=abs(l)-vec3(X.w,Y.w,Z.w)+pr.x,qp=max(q,0.);float lo=length(qp);h=lo+min(max(q.x,max(q.y,q.z)),0.)-pr.x;
   g=lo>0.?qp/lo*sign(l):q.x>=q.y&&q.x>=q.z?vec3(sign(l.x),0.,0.):q.y>=q.z?vec3(0.,sign(l.y),0.):vec3(0.,0.,sign(l.z));}
  else{float rd=length(l.xz);vec2 e=vec2(rd-X.w,abs(l.y)-Y.w),ep=max(e,0.);float lo=length(ep);h=min(max(e.x,e.y),0.)+lo;
   vec3 rv=rd>1e-6?vec3(l.x/rd,0.,l.z/rd):vec3(1.,0.,0.),yv=vec3(0.,sign(l.y),0.);g=lo>0.?(rv*ep.x+yv*ep.y)/lo:e.x>=e.y?rv:yv;}
  float a=pr.y,H=pr.z,b=a+H;if(h<0.||h>=b)continue;
  float t=clamp((h-a)/H,0.,1.),f=h<=a?0.:b*t*t*(3.-2.*t)+H*t*t*(t-1.);
  p+=(X.xyz*g.x+Y.xyz*g.y+Z.xyz*g.z)*((f-h)*m*pr.w);
 }
 return p;
}
#ifdef ANNY_LBS
/* \u043B\u0438\u043D\u0435\u0439\u043D\u043E\u0435 \u0441\u043C\u0435\u0448\u0435\u043D\u0438\u0435 \u0442\u0435\u0445 \u0436\u0435 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0439 (\u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044F \u043D\u0430 \u043B\u0438\u0441\u0442\u0430\u0445: globalThis.ANNY_METHOD = 'lbs') */
vec3 annyLinear(vec3 p,bool dir){
 ivec4 ix=ivec4(annyIndex+.5);vec3 o=vec3(0.);vec4 mr,md;int rs=annyRollSlot(ix,mr,md);
 for(int k=0;k<4;k++){float w=annyWeight[k];if(w<=0.)continue;vec4 r=annyDQ[ix[k]*2],d=annyDQ[ix[k]*2+1];if(k==rs){r=mr;d=md;}o+=w*(dir?annyRotate(r,p):annyMove(r,d,p));}
 return o;
}
#endif
`,px=`attribute vec4 annyColor;
varying vec4 vAnnyColor;
`,mx=`
vAnnyColor=annyColor;`,Uc=i=>i===2?"vec2":"float",gx=i=>i?"attribute "+Uc(i)+` annyLook;
varying `+Uc(i)+` vAnnyLook;
`:"",_x=i=>i?"vAnnyLook=annyLook;":"";function pd(i,e,{normals:t=!0,color:n=!1,lookN:s=0}={}){let r=(n?px:"")+gx(s),o=(n?mx:"")+_x(s);if(globalThis.ANNY_METHOD==="lbs"){i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
#define ANNY_LBS
#define ANNY_FRAMES `+e+`
`+fd+r),t&&(i.vertexShader=i.vertexShader.replace("#include <skinnormal_vertex>","objectNormal=normalize(annyLinear(objectNormal,true));")),i.vertexShader=i.vertexShader.replace("#include <skinning_vertex>","transformed=annySupport(annyLinear(transformed,false),transformed);transformed.y=min(transformed.y,ANNY_FLOOR);"+o);return}i.vertexShader=i.vertexShader.replace("#include <common>",`#include <common>
#define ANNY_FRAMES `+e+`
`+fd+r),t&&(i.vertexShader=i.vertexShader.replace("#include <skinnormal_vertex>",`vec4 annyR,annyD;annyBlend(annyR,annyD);objectNormal=annyRotate(annyR,objectNormal);
#ifdef USE_TANGENT
objectTangent=annyRotate(annyR,objectTangent);
#endif`)),i.vertexShader=i.vertexShader.replace("#include <skinning_vertex>",(t?"":`vec4 annyR,annyD;annyBlend(annyR,annyD);
`)+"transformed=annySupport(annyMove(annyR,annyD,transformed),transformed);transformed.y=min(transformed.y,ANNY_FLOOR);"+o)}function gd(i,e){let t=new ot;t.name="anny",t.visible=!1,i.add(t);let n=null,s=null,r=null,o=null,a=null,l=null,c="",h=null,u={value:.28};function f(d){m();let b=new it;b.setAttribute("position",new Ve(d.pos,3));let x=new Uint16Array(d.idx.length);for(let E=0;E<x.length;E+=3)x[E]=d.idx[E],x[E+1]=d.idx[E+2],x[E+2]=d.idx[E+1];b.setIndex(new Ve(x,1)),b.computeVertexNormals();let g=cx();dx(b,x,d.nv,g.relief?.[0]??0,g.relief?.[1]??6);let R=new He(g.trunks?.color||"#000"),T=g.trunks?.alpha||0,w=(g.ao?.[0]||0)>0||(g.ao?.[1]||0)>0,P=T>0?2:w?1:0,S=P===2?"vAnnyLook.x":"vAnnyLook";b.setAttribute("annyIndex",new Ve(Float32Array.from(d.wi),4)),b.setAttribute("annyWeight",new Ve(d.ww,4));let v=new Float32Array(d.nv*3);if(d.roll)for(let E=0;E<d.nv;E++){let L=d.roll.share[E];if(L>0)for(let B=0;B<4;B++){let q=d.wi[E*4+B],z=d.roll.map[q];if(z>=0&&d.ww[E*4+B]>0){v[E*3]=B,v[E*3+1]=z,v[E*3+2]=L;break}}}if(b.setAttribute("annyRoll",new Ve(v,3)),l=new Ve(new Uint8Array(d.nv*4),4,!0),l.setUsage(ms),b.setAttribute("annyColor",l),P){let E=new Float32Array(d.nv*P);for(let L=0;L<d.nv;L++)if(E[L*P]=d.shade?d.shade[L]:1,P===2){let B=d.frames[d.wi[L*4]];E[L*2+1]=ux.has(B)?Math.max(-8,Math.min(8,hx(d.pos[L*3],Ya-d.pos[L*3+1],d.pos[L*3+2]))):-8}b.setAttribute("annyLook",new Ve(E,P))}d.correctives.length&&(b.morphAttributes.position=d.correctives.map(E=>{let L=new Float32Array(d.nv*3);for(let B=0;B<E.n;B++){let q=E.i[B];L[q*3]=E.d[B*3],L[q*3+1]=E.d[B*3+1],L[q*3+2]=E.d[B*3+2]}return new Ve(L,3)}),b.morphTargetsRelative=!0,b.morphAttributes.normal=fx(d.pos,x,b.morphAttributes.position)),b.boundingSphere=new yn(new U,1e3),b.boundingBox=new Wt(new U(-1e3,-1e3,-1e3),new U(1e3,1e3,1e3)),a={annyDQ:{value:new Float32Array(d.frames.length*8)},annySup:{value:new Float32Array(md*ax)},annySupN:{value:0}},r=e.clone(),r.name="anny-skin",r.side=Vt,r.roughness=g.roughness??e.roughness,a.annyAO={value:new _e(g.ao?.[0]??0,g.ao?.[1]??0)},a.annyTrunk={value:new rt(R.r,R.g,R.b,T)},r.onBeforeCompile=E=>{E.uniforms.annyDQ=a.annyDQ,E.uniforms.annySup=a.annySup,E.uniforms.annySupN=a.annySupN,E.uniforms.annyGlow=u,E.uniforms.annyAO=a.annyAO,E.uniforms.annyTrunk=a.annyTrunk,pd(E,d.frames.length,{color:!0,lookN:P}),E.fragmentShader=E.fragmentShader.replace("#include <common>",`#include <common>
varying vec4 vAnnyColor;
`+(P?"varying "+Uc(P)+` vAnnyLook;
`:"")+`uniform float annyGlow;
uniform vec2 annyAO;
uniform vec4 annyTrunk;
vec3 annyLinear(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(.04045,c));}`).replace("#include <color_fragment>",`#include <color_fragment>
`+(T>0?`float annyFw=max(fwidth(vAnnyLook.y)*.75,1e-3);if(vAnnyLook.y>-annyFw)diffuseColor.rgb=mix(diffuseColor.rgb,annyTrunk.rgb,smoothstep(-annyFw,annyFw,vAnnyLook.y)*annyTrunk.a);
`:"")+"vec3 annyZone=vec3(0.);if(vAnnyColor.a>0.){annyZone=annyLinear(vAnnyColor.rgb);diffuseColor.rgb=mix(diffuseColor.rgb,annyZone,vAnnyColor.a);}").replace("#include <aomap_fragment>",`#include <aomap_fragment>
`+(w?"reflectedLight.indirectDiffuse*=mix(1.,"+S+",annyAO.x);float annyDir=mix(1.,"+S+",annyAO.y);reflectedLight.directDiffuse*=annyDir;reflectedLight.directSpecular*=annyDir;":"")).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance+=annyZone*annyGlow*vAnnyColor.a;`)},r.customProgramCacheKey=()=>"anny-skin-"+d.frames.length+(T>0?"-trunks":"")+(w?"-ao":"")+(globalThis.ANNY_METHOD||""),o=new si({depthPacking:ps}),o.onBeforeCompile=E=>{E.uniforms.annyDQ=a.annyDQ,E.uniforms.annySup=a.annySup,E.uniforms.annySupN=a.annySupN,pd(E,d.frames.length,{normals:!1})},o.customProgramCacheKey=()=>"anny-depth-"+d.frames.length+(globalThis.ANNY_METHOD||""),s=new Ke(b,r),s.name="anny-skin",s.customDepthMaterial=o,s.castShadow=!0,s.receiveShadow=!1,s.frustumCulled=!1,s.matrixAutoUpdate=!1,s.matrix.set(.01,0,0,0,0,-.01,0,Ya/100,0,0,.01,0,0,0,0,1),d.correctives.length&&(s.morphTargetInfluences=new Array(d.correctives.length).fill(0)),t.add(s),n=d,c="",h=[];for(let E=0;E<d.nv;E+=ox)h.push(E)}function p(d,b,x){n!==d&&f(d);let g=globalThis.AnnySkin,R=b.pose,T=g.skinMats(R,d),w=g.correctiveWeights(R,d),P=g.dualQuats(T,d.frames.length);a.annyDQ.value.set(P),s.morphTargetInfluences&&w.forEach((L,B)=>{s.morphTargetInfluences[B]=L});let S=g.supports?g.supports(R,d,b.props||null,w,{S:T,DQ:P}):null;S?(a.annySup.value.set(S.u),a.annySupN.value=S.n):a.annySupN.value=0,_(d,x);let v=g.skin(R,{d,only:h,corr:w,mats:{S:T,DQ:P},sup:S}),E=[];for(let L=0;L<h.length;L++)E.push(new U(v[L*3]/100,(Ya-v[L*3+1])/100,v[L*3+2]/100));return s.userData.boundsPoints=E,t.visible=!0,s}function _(d,b){let x=b?.on?globalThis.AnnySkin.regions(d):null,g=x?x.ids:[],R=[],T="";for(let E of g)for(let L of["L","R"]){let B=b.regions?.[E],V=!!B?.visible&&(!b.selected||b.selected==="all"||b.selected===E||b.selected===B.parent)?b.color(b.sideValues?.[L]?.[E]??b.values?.[E]??.28):null;R.push(V),T+=(V||"-")+"|"}if(T===c)return;c=T;let w=new He,P={},S=R.map(E=>E?(w.set(E).getRGB(P,St),[Math.round(P.r*255),Math.round(P.g*255),Math.round(P.b*255),255]):[0,0,0,0]),v=l.array;if(v.fill(0),x)for(let E=0;E<d.nv;E++){let L=x.rid[E];if(!L)continue;let B=S[(L-1)*2+d.region.side[E]];B[3]&&(v[E*4]=B[0],v[E*4+1]=B[1],v[E*4+2]=B[2],v[E*4+3]=255)}l.needsUpdate=!0}function y(){t.visible=!1}function m(){s&&(s.geometry.dispose(),t.remove(s)),r?.dispose(),o?.dispose(),s=r=o=null,n=null}return{group:t,update:p,hide:y,dispose:m,setGlow(d){u.value=d},get mesh(){return s}}}var Yt=i=>[i[0]/100,(186-i[1])/100,i[2]/100],Ts=i=>[i[0],-i[1],i[2]],Oi=i=>new U(...i),hi=(i,e)=>[i[0]-e[0],i[1]-e[1],i[2]-e[2]],ws=(i,e,t=1)=>[i[0]+e[0]*t,i[1]+e[1]*t,i[2]+e[2]*t],Nc=i=>Math.hypot(...i),Zt=i=>{let e=Nc(i)||1;return i.map(t=>t/e)},_d=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2],Za=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],xx=new Set(["beam","obox","cyl","sphere","cable","prism"]),Nr=i=>xx.has(i.kind)||i.kind==="barbell"&&i.len||i.kind==="dumbbell"&&i.handle||i.kind==="kettlebell"&&i.handleAxis;function Fc(i){return i.kind+(i.kind==="barbell"?JSON.stringify(i.plates||[]):"")+(i.kind==="cable"?":"+i.pts.length+(i.joints?":j":"")+(i.flat?":f":""):"")+(i.kind==="beam"?i.r?":r":":w":"")+(i.kind==="cyl"?":"+(i.sides||24):"")+(i.kind==="prism"?":"+yx(i):"")}var yx=i=>i.pts.length+":"+i.len+":"+i.pts.reduce((e,t)=>e+t[0]*1.7+t[1]*2.3,0).toFixed(3);function vx(i){let e=new as(i.pts.map(n=>new _e(n[0]/100,n[1]/100))),t=new mr(e,{depth:i.len/100,bevelEnabled:!1,curveSegments:1});return t.translate(0,0,-i.len/200),t.computeVertexNormals(),t}function Ur(i,e,t){let n=Zt(Ts(i)),s=Zt(Ts(e)),r=Za(n,s);return new Ct().setFromRotationMatrix(new Qe().makeBasis(Oi(n),Oi(s),Oi(r)))}var Ja=new U(0,1,0);function xd(i,e,t){let n=hi(t,e),s=Nc(n);return i.visible=s>1e-4,i.visible?(i.position.fromArray(Yt(ws(e,n,.5))),i.quaternion.setFromUnitVectors(Ja,Oi(Zt(Ts(n)))),s):0}var yd=i=>i.size.map(e=>e.toFixed(2)).join(",")+":"+(i.round??.6);function vd(i){let[e,t,n]=i.size.map(r=>Math.max(.05,r)/100),s=Math.min((i.round??.6)/100,Math.min(e,t,n)*.45);return new Vn(e,t,n,s>.004?3:1,Math.max(1e-4,s))}function Md(i,e,t,n){let s=new ot;s.name="prop-"+e.kind+(e.id?":"+e.id:""),i.add(s);let r=t[e.tone]||t.frame||t.steel;if(e.kind==="beam")e.r?n(s,new _t(1,1,1,16),r,"beam"):n(s,new Vn(1,1,1,2,.08),r,"beam");else if(e.kind==="obox"){let o=n(s,vd(e),r,"box");o.userData.size=yd(e)}else if(e.kind==="cyl")n(s,new _t(1,1,1,e.sides||24),r,"cyl");else if(e.kind==="sphere")n(s,new It(1,18,12),r,"sphere");else if(e.kind==="prism")n(s,vx(e),r,"prism");else if(e.kind==="cable"){for(let o=1;o<e.pts.length;o++)n(s,e.flat?new dn(1,1,1):new _t(1,1,1,e.joints?12:8),r,"cable");if(e.joints&&!e.flat)for(let o=1;o<e.pts.length-1;o++)n(s,new It(1,12,8),r,"joint")}else if(e.kind==="barbell"){n(s,new _t(1,1,1,18),t.chrome,"shaft");for(let o of[-1,1])n(s,new _t(1,1,1,18),t.chrome,"sleeve").userData.sign=o,n(s,new _t(1,1,1,18),t.chrome,"collar").userData.sign=o,(e.plates||[]).forEach((a,l)=>{let c=n(s,new _t(1,1,1,32),t.plate,"plate");c.userData={sign:o,i:l}})}else if(e.kind==="kettlebell"){let o=e.radius||10.5,a=(e.bottom??7.83*o/10.5)/o,l=Math.acos(-a),c=[];for(let f=0;f<=24;f++){let p=l*f/24;c.push(new _e(Math.sin(p),Math.cos(p)))}c.push(new _e(0,-a)),n(s,new gr(c.reverse(),32),t.plate,"bell");let h=(e.handleUp??15.6*(e.radius||10.5)/10.5)/(e.radius||10.5)*10.5,u=[[-7.2,6.5],[-9.2,h-4.6],[-8.4,h-1],[-5,h],[5,h],[8.4,h-1],[9.2,h-4.6],[7.2,6.5]].map(([f,p])=>new U(f/10.5,p/10.5,0));n(s,new Tn(new Mn(u),40,.16,10,!1),t.plate,"handle")}else if(e.kind==="dumbbell"){n(s,new _t(1,1,1,14),t.chrome,"handle");for(let o of[-1,1])n(s,new _t(1,1,1,6),t.plate,"head").userData.sign=o,n(s,new _t(1,1,1,14),t.chrome,"inner").userData.sign=o}return{group:s,kind:e.kind,key:Fc(e)}}function Sd(i,e){let t=i.group,n=t.children;if(t.visible=!0,e.kind==="beam"){let s=n[0],r=xd(s,e.a,e.b);if(e.r)s.scale.set(e.r/100,r/100,e.r/100);else{let o=Zt(hi(e.b,e.a)),a=hi(e.up||[0,-1,0],o.map(c=>c*_d(e.up||[0,-1,0],o)));Nc(a)<1e-6&&(a=Math.abs(o[2])<.9?hi([0,0,1],o.map(c=>c*o[2])):hi([1,0,0],o.map(c=>c*o[0]))),a=Zt(a);let l=Za(o,a);s.quaternion.copy(Ur(l,o,a)),s.scale.set(e.w/100,r/100,e.h/100)}}else if(e.kind==="obox"){let s=n[0],r=yd(e);s.userData.size!==r&&(s.geometry.dispose(),s.geometry=vd(e),s.userData.size=r),s.position.fromArray(Yt(e.c)),s.quaternion.copy(Ur(e.x,e.y,e.z)),s.scale.set(1,1,1)}else if(e.kind==="cyl"){let s=n[0];s.position.fromArray(Yt(e.c)),s.quaternion.setFromUnitVectors(Ja,Oi(Zt(Ts(e.axis)))),s.scale.set(e.r/100,e.len/100,e.r/100)}else if(e.kind==="sphere"){let s=n[0];s.position.fromArray(Yt(e.c)),s.scale.setScalar(e.r/100)}else if(e.kind==="prism"){let s=n[0];s.position.fromArray(Yt(e.c)),s.quaternion.copy(Ur(e.u,e.v,e.w))}else if(e.kind==="cable"){let s=e.pts.length-1;for(let r=1;r<=s;r++){let o=n[r-1],a=xd(o,e.pts[r-1],e.pts[r]),l=e.rs?e.rs[r-1]:e.r;if(e.flat&&a>1e-4){let c=Zt(hi(e.pts[r],e.pts[r-1])),h=e.nrm?.[r-1]||[0,-1,0],u=Zt(hi(h,c.map(p=>p*_d(h,c)))),f=Za(c,u);o.quaternion.copy(Ur(f,c,u)),o.scale.set(e.flat[0]/100,a/100,e.flat[1]/100)}else o.scale.set(l/100,a/100,l/100)}if(e.joints&&!e.flat)for(let r=1;r<s;r++){let o=n[s+r-1],a=e.rs?Math.max(e.rs[r-1],e.rs[r]):e.r;o.position.fromArray(Yt(e.pts[r])),o.scale.setScalar(a/100)}}else if(e.kind==="barbell"){let s=Zt(e.axis),r=e.c,o=new Ct().setFromUnitVectors(Ja,Oi(Zt(Ts(s))));for(let a of n){a.quaternion.copy(o);let l=a.userData.sign;if(a.name==="shaft")a.position.fromArray(Yt(r)),a.scale.set(e.shaftR/100,2*e.inner/100,e.shaftR/100);else if(a.name==="collar")a.position.fromArray(Yt(ws(r,s,l*(e.inner+1)))),a.scale.set(3.6/100,2/100,3.6/100);else if(a.name==="sleeve"){let c=e.inner+2,h=e.len/2;a.position.fromArray(Yt(ws(r,s,l*(c+h)/2))),a.scale.set(e.sleeveR/100,(h-c)/100,e.sleeveR/100)}else if(a.name==="plate"){let c=e.inner+2.4;for(let f=0;f<a.userData.i;f++)c+=e.plates[f][1]+.3;let[h,u]=e.plates[a.userData.i];a.position.fromArray(Yt(ws(r,s,l*(c+u/2)))),a.scale.set(h/100,u/100,h/100)}}}else if(e.kind==="kettlebell"){let s=Zt(hi(e.grip,e.c)),r=Zt(e.handleAxis),o=Za(r,s);t.position.fromArray(Yt(e.c)),t.quaternion.copy(Ur(r,s,o)),t.scale.setScalar(e.radius/100)}else if(e.kind==="dumbbell"){let s=Zt(e.axis),r=e.c,o=new Ct().setFromUnitVectors(Ja,Oi(Zt(Ts(s))));for(let a of n){a.quaternion.copy(o);let l=a.userData.sign;a.name==="handle"?(a.position.fromArray(Yt(r)),a.scale.set(1.6/100,(e.handle+2)/100,1.6/100)):a.name==="inner"?(a.position.fromArray(Yt(ws(r,s,l*(e.handle/2+.6)))),a.scale.set(2.6/100,1.2/100,2.6/100)):(a.position.fromArray(Yt(ws(r,s,l*(e.handle/2+1.2+e.headLen/2)))),a.scale.set(e.headR/100,e.headLen/100,e.headR/100))}}}var Gn=(i,e,t=1)=>i.map((n,s)=>n+e[s]*t),Rs=(i,e)=>i.map((t,n)=>t-e[n]),Mx=(i,e)=>i.reduce((t,n,s)=>t+n*e[s],0),$a=i=>Math.hypot(...i),ui=i=>{let e=$a(i);if(e<1e-8)throw Error("Degenerate scene direction");return i.map(t=>t/e)},Bc=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],zt=i=>[i[0]/100,(186-i[1])/100,i[2]/100],Wn=i=>[i[0],-i[1],i[2]],zi=i=>new U(...i),Fr={above:[35,-55],angle:[55,-15],side:[90,0],front:[0,0],back:[180,0],rear:[235,-15]};function Sx(i,e,t){let n=ui(Rs(e,i)),s=Rs(t,n.map(r=>r*Mx(t,n)));return $a(s)<1e-5&&(s=Bc(n,Math.abs(n[0])<.8?[1,0,0]:[0,0,1])),s=ui(s),{x:s,y:ui(Bc(n,s)),z:n}}function bd(i,e,t){return new Ct().setFromRotationMatrix(new Qe().makeBasis(zi(i),zi(e),zi(t)))}function wt(i,{roughness:e=.6,metalness:t=0}={}){return new Bt({color:i,roughness:e,metalness:t,side:Pt})}function Jt(i,e,t,n){let s=new Ke(e,t);return s.name=n,s.castShadow=!0,s.receiveShadow=!0,i.add(s),s}var At={background:["#1b2636","#0b1119"],floor:["#44536b","#111925"],hemi:[15002871,3818066,2.1],key:[16773600,1.9,[-2.2,5.2,3.2]],fill:[12374783,.9,[3.4,1.6,2.4]],rim:[14214911,1.5,[1.2,3.2,-4.6]],environment:0,shadow:"pcf",exposure:.93,muscleGlow:.28},Bi={core:.03,rim:.62,power:2.2,color:"#cfdbec",order:4};function bx(){let i=new Bt({color:Bi.color,roughness:.7,metalness:0,transparent:!0,depthWrite:!1,side:Pt}),e=t=>t.toFixed(4);return i.onBeforeCompile=t=>{t.fragmentShader=t.fragmentShader.replace("#include <opaque_fragment>",`
   vec3 ghostView=isOrthographic?vec3(0.,0.,1.):normalize(vViewPosition);
   float ghostRim=pow(1.-clamp(abs(dot(normalize(normal),ghostView)),0.,1.),${e(Bi.power)});
   gl_FragColor=vec4(outgoingLight,${e(Bi.core)}+${e(Bi.rim-Bi.core)}*ghostRim);`)},i.name="ghost-skin",i.customProgramCacheKey=()=>"ghost-skin",i.forceSinglePass=!0,i}function Ex(i,e,t=128){let n=new He(i),s=new He(e),r=new Uint8Array(t*t*4),o=new He;for(let l=0;l<t;l++)for(let c=0;c<t;c++){let h=Math.min(1,Math.hypot(c/(t-1)-.5,l/(t-1)-.5)*2),u=h*h*(3-2*h);o.copy(n).lerp(s,u);let f=(l*t+c)*4;r[f]=Math.round(o.r*255),r[f+1]=Math.round(o.g*255),r[f+2]=Math.round(o.b*255),r[f+3]=255}let a=new ii(r,t,t);return a.colorSpace=St,a.magFilter=Gt,a.minFilter=Gt,a.needsUpdate=!0,a}function wx(i,e,t,n){let s=[],r=[],o=i/2,a=i/e,l=new He(t),c=(f,p)=>Math.max(0,1-Math.hypot(f,p)/o)**1.6;for(let f=0;f<=e;f++){let p=-o+f*a;for(let _=0;_<e;_++){let y=-o+_*a,m=y+a;s.push(p,0,y,p,0,m,y,0,p,m,0,p);for(let[d,b]of[[p,y],[p,m],[y,p],[m,p]])r.push(l.r,l.g,l.b,c(d,b))}}let h=new it;h.setAttribute("position",new at(s,3)),h.setAttribute("color",new at(r,4));let u=new nr(h,new On({vertexColors:!0,transparent:!0,opacity:.55,depthWrite:!1}));return u.name="floor-grid",u.position.set(...n),u}function Tx(i,e,t){i.position.fromArray(zt(e)),i.scale.set(...t.map(n=>n/100))}function Oc(i,e,t,n){let s=Rs(t,e),r=$a(s);i.visible=r>1e-5,i.visible&&(i.position.fromArray(zt(Gn(e,t).map(o=>o/2))),i.scale.set(n/200,r/100,n/200),i.quaternion.setFromUnitVectors(new U(0,1,0),zi(Wn(ui(s)))))}var As=i=>!i.dyn&&Nr(i);function zc(i,e){if(i===e)return!0;if(Array.isArray(i)){if(!Array.isArray(e)||i.length!==e.length)return!1;for(let n=0;n<i.length;n++)if(!zc(i[n],e[n]))return!1;return!0}if(!i||!e||typeof i!="object"||typeof e!="object"||Array.isArray(e))return!1;let t=Object.keys(i);if(t.length!==Object.keys(e).length)return!1;for(let n of t)if(!zc(i[n],e[n]))return!1;return!0}function Ax(i){let e=0,t=0;for(let u of i){let f=u.geometry;e+=f.attributes.position.count,t+=f.index?f.index.count:f.attributes.position.count}let n=new Float32Array(e*3),s=new Float32Array(e*3),r=e>65535?new Uint32Array(t):new Uint16Array(t),o=new U,a=new qe,l=0,c=0;for(let u of i){let f=u.geometry,p=f.attributes.position,_=f.attributes.normal,y=u.matrixWorld,m=y.determinant()<0,d=f.index;a.getNormalMatrix(y);for(let g=0;g<p.count;g++)o.fromBufferAttribute(p,g).applyMatrix4(y),n[(l+g)*3]=o.x,n[(l+g)*3+1]=o.y,n[(l+g)*3+2]=o.z,o.fromBufferAttribute(_,g).applyMatrix3(a).normalize(),s[(l+g)*3]=o.x,s[(l+g)*3+1]=o.y,s[(l+g)*3+2]=o.z;let b=d?d.count:p.count,x=g=>l+(d?d.getX(g):g);for(let g=0;g+2<b;g+=3)r[c++]=x(g),m?(r[c++]=x(g+2),r[c++]=x(g+1)):(r[c++]=x(g+1),r[c++]=x(g+2));l+=p.count}let h=new it;return h.setAttribute("position",new Ve(n,3)),h.setAttribute("normal",new Ve(s,3)),h.setIndex(new Ve(r.subarray(0,c),1)),h.computeBoundingSphere(),h.computeBoundingBox(),h}function Ka(i){let e=new Fn;e.background=new He(At.background[1]);let t=wt("#a0adc0",{roughness:.62}),n=wt("#96a4b8",{roughness:.6}),s=wt("#323c4c",{roughness:.78}),r={steel:wt("#6a7fa2",{roughness:.42,metalness:.25}),bar:wt("#d3dbe6",{roughness:.26,metalness:.5}),pad:wt("#3c4a62",{roughness:.66}),plate:wt("#3d506b",{roughness:.5,metalness:.15}),cable:wt("#8494aa",{roughness:.35,metalness:.4}),band:wt("#6f9fc7",{roughness:.7}),mat:wt("#2a3a52",{roughness:.95}),frame:wt("#7186a7",{roughness:.45,metalness:.25}),chrome:wt("#dde4ee",{roughness:.24,metalness:.5}),rubber:wt("#2b3341",{roughness:.95}),wood:wt("#7a6450",{roughness:.78}),wall:wt("#2a3546",{roughness:.92}),stack:wt("#53668a",{roughness:.4,metalness:.3}),rope:wt("#b8a07a",{roughness:.92}),towel:wt("#c9cfd8",{roughness:1})},o=new yr(At.hemi[0],At.hemi[1],At.hemi[2]);e.add(o);let a=(I,O,H)=>{let k=new Mr(I,O);return k.position.set(...H),e.add(k),e.add(k.target),k},l=a(...At.key),c=a(...At.fill),h=a(...At.rim);l.name="key-light",c.name="fill-light",h.name="rim-light";let u=Ex(...At.floor),f=Jt(e,new Ti(12,12),new Bt({map:u,roughness:.94,metalness:0}),"floor");f.rotation.x=-Math.PI/2,f.position.y=-.014,f.castShadow=!1,f.position.z=.6;let p=wx(5,20,4742006,[0,-.01,1]);e.add(p);let _=sd(e,i,{skin:t,joint:n,sole:s,mesh:Jt}),y=_.parts,m=_.parts.torso.mesh,d=_.parts.head.mesh,b=gd(e,t),x=!1,g=od(e),R=dd(e),T=!1,w=bx(),P=new en({name:"ghost-depth",colorWrite:!1,depthWrite:!0,transparent:!0,side:Pt,forceSinglePass:!0});function S(I){T=I;let O=[];_.group.traverse(H=>{H.isMesh&&!H.userData.ghostTwin&&O.push(H)});for(let H of O){H.userData.skin||(H.userData.skin=H.material),H.material=I?w:H.userData.skin,H.castShadow=!I,H.renderOrder=I?Bi.order+1:0;let k=H.userData.twin;I&&!k&&(k=new Ke(H.geometry,P),k.name="ghost-depth",k.userData.ghostTwin=!0,k.castShadow=k.receiveShadow=!1,k.renderOrder=Bi.order,H.add(k),H.userData.twin=k),k&&(k.visible=I,k.geometry=H.geometry,k.frustumCulled=H.frustumCulled)}}let v=new Map,E=new ot;E.name="regions",e.add(E);let L=new ot;L.name="equipment",e.add(L);let B=[],q,z={},V=new ot;V.name="equipment-static-parts",V.visible=!1,V.userData.drawnMerged=!0,e.add(V);let $=new ot;$.name="equipment-static",e.add($);let G=null;function ue(I){$.traverse(H=>H.geometry?.dispose()),$.clear();let O=new Map;B.forEach((H,k)=>{As(I[k])&&H.group.traverse(J=>{J.isMesh&&J.visible&&(O.has(J.material)||O.set(J.material,[]),O.get(J.material).push(J))})});for(let[H,k]of O){let J=Jt($,Ax(k),H,"static-"+k.length);J.userData.merged=!0,J.userData.sources=k}G=I.map(H=>As(H)?H:null)}let me=new ot;me.name="joint-stress",e.add(me);let Se=new It(1,18,12),Me=new en({color:"#ff3b30",transparent:!0,opacity:.36,depthTest:!1,depthWrite:!1,toneMapped:!1}),Fe=new en({color:"#ff453a",depthTest:!1,depthWrite:!1,toneMapped:!1}),Ze=[],Ye=typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;function ie(I){for(;Ze.length<=I;){let O=new ot;O.name="stress-mark";let H=new Ke(Se,Me),k=new Ke(Se,Fe);H.renderOrder=20,k.renderOrder=21,k.scale.setScalar(.03),O.add(H,k),me.add(O),Ze.push(O)}return Ze[I]}function oe(I){let O=Ye?1:1+.18*Math.sin((typeof performance<"u"?performance.now():0)/170);I.forEach((H,k)=>{let J=ie(k);J.visible=!0,J.position.fromArray(zt(H.p)),J.children[0].scale.setScalar(.078*O)});for(let H=I.length;H<Ze.length;H++)Ze[H].visible=!1}function Ce(I,O){if(Nr(I))return Md(As(I)?V:L,I,r,Jt);let H=new ot;H.name="prop-"+O+"-"+I.kind,L.add(H);let k=r[I.tone]||r.steel;if(I.kind==="box"||I.kind==="panel")Jt(H,new Vn(1,1,1,2,.012),k,"pad");else if(I.kind==="line")Jt(H,new _t(1,1,1,12),k,"beam");else if(["wheel","roller","weight"].includes(I.kind))Jt(H,new _t(1,1,1,18),I.kind==="weight"?r.plate:k,"cylinder");else if(["barbell","dumbbell"].includes(I.kind)){Jt(H,new _t(1,1,1,18),r.bar,"shaft");for(let J of[-1,1]){let ee=Jt(H,new _t(1,1,1,20),r.plate,"plate");ee.userData.sign=J;let de=Jt(H,new _t(1,1,1,12),r.bar,"collar");if(de.userData.sign=J,I.kind==="barbell"){let pe=Jt(H,new _t(1,1,1,16),r.bar,"sleeve");pe.userData.sign=J}}}else if(I.kind==="kettlebell"){let J=Jt(H,new It(1,18,12),r.plate,"kettlebell-body"),ee=Array.from({length:13},(de,pe)=>new U(-.055+pe/12*.11,.042*Math.sin(Math.PI*pe/12),0));Jt(H,new Tn(new Mn(ee),14,.008,7,!1),r.bar,"kettlebell-handle")}else throw Error("Unknown scene prop "+I.kind);return{group:H,kind:I.kind,key:I.kind}}function Le(I,O){if(Nr(O))return Sd(I,O);let H=I.group,k=O.c,J=O.axis||[1,0,0];if(H.visible=!0,O.kind==="box"){let ee=H.children[0],de=Rs(O.hi,O.lo);ee.position.fromArray(zt(Gn(O.lo,O.hi).map(pe=>pe/2))),ee.scale.set(...de.map(pe=>Math.max(.002,pe/100)))}else if(O.kind==="line")Oc(H.children[0],O.a,O.b,O.width);else if(O.kind==="panel"){let ee=H.children[0],de=Sx(O.a,O.b,[1,0,0]);ee.position.fromArray(zt(Gn(O.a,O.b).map(pe=>pe/2))),ee.quaternion.copy(bd(Wn(de.x),Wn(de.y),Wn(de.z).map(pe=>-pe))),ee.scale.set(O.width/100,O.thickness/100,$a(Rs(O.b,O.a))/100)}else if(["wheel","roller","weight"].includes(O.kind)){let ee=H.children[0];ee.position.fromArray(zt(k)),ee.quaternion.setFromUnitVectors(new U(0,1,0),zi(Wn(ui(J))));let de=(O.radius||6)/100;ee.scale.set(de,O.kind==="roller"?.36:.055,de)}else if(["barbell","dumbbell"].includes(O.kind)){let ee=O.kind==="barbell",de=ee?61:12,pe=ee?48:9,C=ee?O.radius||17:6,Z=H.children[0];Oc(Z,Gn(k,J,-de),Gn(k,J,de),ee?2.8:2.4);for(let j of H.children.slice(1)){if(j.name==="sleeve"){Oc(j,Gn(k,J,34*j.userData.sign),Gn(k,J,61*j.userData.sign),5);continue}let Y=j.name==="collar",te=pe+(Y?3:0);j.position.fromArray(zt(Gn(k,J,te*j.userData.sign))),j.quaternion.setFromUnitVectors(new U(0,1,0),zi(Wn(ui(J)))),j.scale.set((Y?3.5:C)/100,Y?.018:ee?.05:.035,(Y?3.5:C)/100)}}else if(O.kind==="kettlebell"){Tx(H.children[0],k,[O.radius||8.5,O.radius||8.5,O.radius||8.5]);let ee=H.children[1],de=ui(Rs(k,O.grip)),pe=[1,0,0],C=ui(Bc(pe,de));ee.position.fromArray(zt(Gn(O.grip,de,3))),ee.quaternion.copy(bd(Wn(pe),Wn(de).map(Z=>-Z),Wn(C)))}}function Pe(I,O={},H={}){q=I,z={...z,...O};let k=I.pose,J=!!H.shape,ee=!!(z.skeleton&&I.body),de=!!(z.anatomy&&I.body),pe=ee||de,C=!pe&&z.anny!==!1&&I.pose?.frames?globalThis.AnnySkin?.data:null;x=!!C,_.group.visible=!C,C?_.dots(I,z):_.apply(I,z,J),C?b.update(C,I,{on:z.muscles!==!1,color:z.color,values:I.values,sideValues:I.sideValues,regions:I.regions,selected:z.selected}):b?.hide();let Z=de?I.boneFrames||globalThis.Skeleton.frames(k,I.body,z.anatomy.skeleton.bones):null;ee?g.update(z.skeleton,k,I.body,Z&&z.anatomy.skeleton===z.skeleton?Z:I.boneFrames||void 0):g.hide(),de?R.update(z.anatomy,Z,z.color,{values:I.values,sideValues:I.sideValues,regions:I.regions,phases:z.muscles!==!1,selected:z.selected},I.poseKey&&typeof I.phase=="number"?{t:I.phase,key:I.poseKey}:null):R.hide(),(pe||T)&&S(pe);let j=C?[]:I.surfaces;if(pe||!j.length)for(let Ee of v.values())Ee.visible=!1;let Y=new Map;for(let Ee of j){let F=Ee.id+":"+Ee.side;Y.has(F)||Y.set(F,[]),Y.get(F).push(Ee)}for(let[Ee,F]of Y){let re=v.get(Ee);if(!re){let we=new it;we.setAttribute("position",new Ve(new Float32Array(F.length*6*3),3));let be=wt("#a7b3c6",{roughness:.82});be.polygonOffset=!0,be.polygonOffsetFactor=-1,be.polygonOffsetUnits=-1,re=Jt(E,we,be,Ee),re.receiveShadow=!1,re.userData={region:F[0].id,side:F[0].side},v.set(Ee,re)}re.geometry.attributes.position.count!==F.length*6&&(re.geometry.dispose(),re.geometry=new it,re.geometry.setAttribute("position",new Ve(new Float32Array(F.length*6*3),3)));let ve=0,Ae=re.geometry.attributes.position;for(let we of F)for(let be of[0,1,2,0,2,3])Ae.setXYZ(ve++,...zt(we.points[be]));Ae.needsUpdate=!0,J||(re.geometry.computeVertexNormals(),re.geometry.computeBoundingSphere()),re.geometry.computeBoundingBox();let fe=F[0].id,le=F[0].side,Ie=z.muscles!==!1&&!pe,ze=Ie&&(!z.selected||z.selected==="all"||z.selected===fe||z.selected===F[0].parent);re.visible=Ie,re.material.color.set(ze?z.color(I.sideValues?.[le]?.[fe]??I.values[fe]??.28):"#a0adc0"),ze?re.material.emissive.copy(re.material.color).multiplyScalar(At.muscleGlow):re.material.emissive.setRGB(0,0,0)}if(B.length!==I.props.length||B.some((Ee,F)=>Ee.key!==(Nr(I.props[F])?Fc(I.props[F]):I.props[F].kind)||Ee.group.parent!==(As(I.props[F])?V:L))){for(let Ee of[L,V,$])Ee.traverse(F=>F.geometry?.dispose()),Ee.clear();B=I.props.map(Ce),G=null}let te=!!G&&I.props.every((Ee,F)=>!As(Ee)||zc(G[F],Ee));I.props.forEach((Ee,F)=>{(!te||!As(Ee))&&Le(B[F],Ee)}),oe(z.stress?I.stress||[]:[]),e.updateMatrixWorld(!0),te||ue(I.props)}let Xe=Object.fromEntries(Object.entries(Fr).map(([I,[O,H]])=>{let k=O*Math.PI/180,J=H*Math.PI/180,ee=[-Math.sin(k)*Math.cos(J),-Math.sin(J),Math.cos(k)*Math.cos(J)],de=new Bn(-1,1,1,-1,.01,30);return de.position.fromArray(ee.map(pe=>pe*8)),de.lookAt(0,0,0),de.updateMatrixWorld(!0),[I,de]})),et=Object.fromEntries(Object.keys(Xe).map(I=>[I,{minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0}])),N=(I,O)=>{for(let H=I;H;H=H.parent)if(H===O)return!0;return!1},ce=I=>x?N(I,_.group):N(I,b.group);function ae(I,O){let H=I==="body"?x?b.group:_.group:e,k=J=>{O?.(J.x,J.y,J.z);for(let[ee,de]of Object.entries(Xe)){let pe=J.clone().applyMatrix4(de.matrixWorldInverse),C=et[ee];C.minX=Math.min(C.minX,pe.x),C.maxX=Math.max(C.maxX,pe.x),C.minY=Math.min(C.minY,pe.y),C.maxY=Math.max(C.maxY,pe.y)}};H.traverse(J=>{if(!J.isMesh||!J.visible||J===f||J.name==="dot-ring"||J.parent?.name==="joint-dots"||J.parent?.parent===me||J.userData.merged||J.userData.ghostTwin||ce(J))return;if(J.userData.boundsPoints){for(let de of J.userData.boundsPoints)k(de);return}J.geometry.boundingBox||J.geometry.computeBoundingBox();let ee=J.geometry.boundingBox;for(let de of[ee.min.x,ee.max.x])for(let pe of[ee.min.y,ee.max.y])for(let C of[ee.min.z,ee.max.z])k(zi([de,pe,C]).applyMatrix4(J.matrixWorld))})}function ne(I,O,H=1.13){for(let[k,J]of Object.entries(Xe)){let ee=et[k],de=(ee.minX+ee.maxX)/2,pe=(ee.minY+ee.maxY)/2,C=(ee.maxX-ee.minX)*H,Z=(ee.maxY-ee.minY)*H,j=I/O;C/Z<j?C=Z*j:Z=C/j,J.left=de-C/2,J.right=de+C/2,J.top=pe+Z/2,J.bottom=pe-Z/2,J.updateProjectionMatrix()}}let se=[],xe=null;function he(I){if(!I?.isWebGLRenderer)return!1;if(ye=I,I.toneMapping=ea,I.toneMappingExposure=At.exposure,I.outputColorSpace=St,I.shadowMap.enabled=!!At.shadow,I.shadowMap.type=At.shadow==="soft"?Xo:br,At.environment)try{let O=new vs(I),H=new Wa,k=O.fromScene(H,.04);se.push(k),H.dispose?.(),O.dispose(),xe=k.texture;for(let J of Object.values(r))J.metalness>=.3&&(J.envMap=xe,J.envMapIntensity=At.environment,J.needsUpdate=!0)}catch{xe=null}if(typeof document<"u"){let O=document.createElement("canvas");O.width=O.height=256;let H=O.getContext("2d");if(H){let k=H.createRadialGradient(128,112,10,128,128,190);k.addColorStop(0,At.background[0]),k.addColorStop(1,At.background[1]),H.fillStyle=k,H.fillRect(0,0,256,256);let J=new ir(O);J.colorSpace=St,e.background=J,se.push(J)}}return l.castShadow=!!At.shadow,l.shadow.mapSize.set(1024,1024),l.shadow.bias=-4e-4,l.shadow.normalBias=.02,l.shadow.radius=4,e.getObjectByName("joint-dots")?.traverse(O=>{O.castShadow=!1,O.receiveShadow=!1}),Be(),!0}let ye=null;function Ge(I){ye&&(I=!!I&&!!At.shadow,ye.shadowMap.enabled!==I&&(ye.shadowMap.enabled=I,l.castShadow=I,e.traverse(O=>{if(O.material)for(let H of[].concat(O.material))H.needsUpdate=!0})))}function Be(){let I=new Wt;e.traverse(J=>{if(!(!J.isMesh||!J.visible||J===f||J.name==="dot-ring"||J.parent?.name==="joint-dots"||J.parent?.parent===me||J.userData.merged||ce(J))){if(J.userData.boundsPoints){for(let ee of J.userData.boundsPoints)I.expandByPoint(ee);return}I.expandByObject(J)}}),I.isEmpty()&&I.set(new U(-1,0,-1),new U(1,2,2)),I.expandByScalar(.7);let O=I.getCenter(new U),H=I.getSize(new U).length()/2;for(let J of[l,c,h])J.target.position.copy(O),J.position.copy(O).add(J.userData.dir||(J.userData.dir=J.position.clone().normalize().multiplyScalar(8))),J.target.updateMatrixWorld();let k=l.shadow.camera;k.left=-H,k.right=H,k.top=H,k.bottom=-H,k.near=.1,k.far=8+H*2,k.updateProjectionMatrix(),l.shadow.needsUpdate=!0}return Pe(i,{color:()=>"#a7b3c6"}),{scene:e,cameras:Xe,apply:Pe,includeBounds:ae,resize:ne,bounds:et,regionMeshes:v,parts:y,body:m,head:d,mannequin:_,skeleton:g,muscleLayer:R,propNodes:()=>B,staticMeshes:()=>$.children,studio:he,fitShadow:Be,setShadows:Ge,anny:b,dispose(){D(),M()},disposeGeometry:D,disposeMaterials:M};function D(){e.traverse(I=>{if(I.geometry?.dispose(),I.isLight&&I.shadow?.map&&I.shadow.dispose(),I.material)for(let O of[].concat(I.material))O.map?.dispose()});for(let I of se)I.dispose();se=[],g.disposeTexture()}function M(){let I=new Set([w,P]);e.traverse(O=>{if(O.material)for(let H of[].concat(O.material))I.add(H);O.customDepthMaterial&&I.add(O.customDepthMaterial)});for(let O of I)O.dispose()}}var kc=[.6,.8,1,1.25,1.6,2,2.6,3.4],Hc=400,Ed=160,wd=15,Td=10,Vc=1.25,di=Math.PI/180,Rx=12,Cx=.3,Cs=(i,e)=>i[0]*e[0]+i[1]*e[1]+i[2]*e[2],Gc=(i,e,t)=>Math.min(t,Math.max(e,i)),Or=i=>(i=(i+Math.PI)%(2*Math.PI),i<0&&(i+=2*Math.PI),i-Math.PI),Br=(i={})=>({fov:i.fov??28,pad:i.pad??1.13,settings:i.settings});function Qa(i,e){let t=Math.cos(i),n=Math.sin(i),s=Math.cos(e),r=Math.sin(e);return{right:[t,0,n],up:[n*r,s,-t*r],back:[-n*s,r,t*s]}}function el(i,e){let t=i[e];return{yaw:Or(t[0]*di),pitch:-t[1]*di}}var Wc=i=>[(i[0]+i[3])/2,(i[1]+i[4])/2,(i[2]+i[5])/2],Ad=i=>[(i[3]-i[0])/2,(i[4]-i[1])/2,(i[5]-i[2])/2],Rd=i=>Math.hypot(...Ad(i));function Cd(i,e={}){let{fov:t,pad:n}=Br(e),s=t>0?Math.tan(t*di/2)/n:0,r=s?kc.map(f=>f*s):[],o=r.length,a=Object.keys(i).map(f=>{let p=el(i,f),_=Qa(p.yaw,p.pitch);return{id:f,R:_.right,U:_.up,B:_.back,r:[1/0,-1/0,1/0,-1/0],x:new Array(2*o).fill(-1/0),y:s?[-1/0,-1/0]:[]}}),l=[1/0,1/0,1/0,-1/0,-1/0,-1/0],c=0;function h(f,p,_){if(!(!Number.isFinite(f)||!Number.isFinite(p)||!Number.isFinite(_))){c++,f<l[0]&&(l[0]=f),p<l[1]&&(l[1]=p),_<l[2]&&(l[2]=_),f>l[3]&&(l[3]=f),p>l[4]&&(l[4]=p),_>l[5]&&(l[5]=_);for(let y of a){let m=y.R[0]*f+y.R[2]*_,d=y.U[0]*f+y.U[1]*p+y.U[2]*_,b=y.B[0]*f+y.B[1]*p+y.B[2]*_,x=y.r;m<x[0]&&(x[0]=m),m>x[1]&&(x[1]=m),d<x[2]&&(x[2]=d),d>x[3]&&(x[3]=d);for(let g=0;g<o;g++){let R=r[g],T=m+R*b,w=R*b-m;T>y.x[g]&&(y.x[g]=T),w>y.x[o+g]&&(y.x[o+g]=w)}if(s){let g=d+s*b,R=s*b-d;g>y.y[0]&&(y.y[0]=g),R>y.y[1]&&(y.y[1]=R)}}}}function u(){if(!c)return null;let f=_=>Math.ceil(_*1e4)/1e4,p=_=>Math.floor(_*1e4)/1e4;return{fov:t,pad:n,box:[...l.slice(0,3).map(p),...l.slice(3).map(f)],cams:Object.fromEntries(a.map(_=>[_.id,{r:[p(_.r[0]),f(_.r[1]),p(_.r[2]),f(_.r[3])],x:_.x.map(f),y:_.y.map(f)}]))}}return{add:h,data:u,get count(){return c}}}function Id(i,e={}){let{fov:t,pad:n,settings:s}=Br(e),r=t>0?kc.length:0,o=a=>Array.isArray(a)&&a.every(Number.isFinite);return!i||typeof i!="object"||i.fov!==t||i.pad!==n||!o(i.box)||i.box.length!==6||!i.cams?!1:Object.keys(s).every(a=>{let l=i.cams[a];return l&&o(l.r)&&l.r.length===4&&o(l.x)&&l.x.length===2*r&&o(l.y)&&l.y.length===(r?2:0)})}function Ix(i,e,t){let n=kc.map(c=>c*t),s=n.length,r=c=>i.x[c],o=c=>i.x[s+c];if(e>=n[s-1])return[r(s-1),o(s-1),n[s-1]];if(e<=n[0]){let c=e/n[0];return[i.r[1]+(r(0)-i.r[1])*c,-i.r[0]+(o(0)+i.r[0])*c,e]}let a=0;for(;e>n[a+1];)a++;let l=(e-n[a])/(n[a+1]-n[a]);return[r(a)+(r(a+1)-r(a))*l,o(a)+(o(a+1)-o(a))*l,e]}function Pd(i,e,t,n={}){let{fov:s,pad:r,settings:o}=Br(n),{yaw:a,pitch:l}=el(o,e),c=Qa(a,l),h=i.cams[e],u=Wc(i.box);t=t>0?t:1;let f,p,_,y;if(s>0){let b=Math.tan(s*di/2),x=b/r,[g,R,T]=Ix(h,x*t,x),w=Math.max((g+R)/(2*T),(h.y[0]+h.y[1])/(2*x));f=(g-R)/2,p=(h.y[0]-h.y[1])/2,_=Math.max(Cx,w-Cs(c.back,u)),y=_*b}else{let b=h.r;f=(b[0]+b[1])/2,p=(b[2]+b[3])/2;let x=Math.max(.001,(b[1]-b[0])*r),g=Math.max(.001,(b[3]-b[2])*r);x/g<t?x=g*t:g=x/t,y=g/2,_=Rx+Rd(i.box)}let m=f-Cs(c.right,u),d=p-Cs(c.up,u);return{yaw:a,pitch:l,d:_,s:y,ox:m,oy:d,zoom:1,px:m,py:d}}function Xc(i,e,t,n={}){let{fov:s}=Br(n),r=Qa(e.yaw,e.pitch),o=Wc(i.box),a=Rd(i.box),l=[0,1,2].map(h=>o[h]+e.d*r.back[h]+e.ox*r.right[h]+e.oy*r.up[h]),c={...r,position:l,zoom:e.zoom,far:e.d+a+20};return s>0?{...c,fov:s,near:Math.max(.05,(e.d-a)*.5)}:{...c,half:[e.s*t,e.s],near:.01}}function Dd(i,e,t,n,s={}){let r=Xc(i,e,t,s),o=[n[0]-r.position[0],n[1]-r.position[1],n[2]-r.position[2]],a=Cs(r.right,o),l=Cs(r.up,o),c=-Cs(r.back,o);if(r.fov){let h=Math.tan(r.fov*di/2)/e.zoom;return[a/(c*h*t),l/(c*h),c]}return[a*e.zoom/r.half[0],l*e.zoom/r.half[1],c]}function Ld(i,e,t,n={}){let{fov:s,pad:r}=Br(n),o=Wc(i.box),a=Ad(i.box),l=Math.max(.001,Math.hypot(...a)),c=Qa(e.yaw,e.pitch),h=Math.min(1,t>0?t:1),u=Math.abs(c.right[0])*a[0]+Math.abs(c.right[2])*a[2],f=Math.abs(c.up[0])*a[0]+Math.abs(c.up[1])*a[1]+Math.abs(c.up[2])*a[2],p,_=0;if(s>0){let y=Math.tan(s*di/2);p=e.d>l*1.01?y*h*Math.sqrt(e.d*e.d-l*l)/(r*l):.3,_=Math.asin(Gc((.25-o[1]-e.oy)/e.d,-1,1))}else p=e.s*h/(r*l);return{zMin:Math.min(1,Math.max(.3,p)),zMax:4,ex:u,ey:f,pitchMin:Math.max(-8*di,_),pitchMax:85*di}}var Ud=i=>Math.max(.3,1-.7/i);function ja(i,e,t,n=1){let s=Math.max(t,Math.abs(i)*n);return Math.abs(e)<=s?e:Math.sign(e)*s}function tl(i,e,t,n){let s=Math.min(n.pitchMin,i.pitch),r=Math.max(n.pitchMax,i.pitch);return{...i,yaw:Or(i.yaw+e),pitch:Gc(i.pitch+t,s,r)}}function Nd(i,e,t,n,s){let r=Ud(i.zoom),o=i.s*n/i.zoom,a=i.s/i.zoom;return{...i,ox:ja(i.ox,i.ox-e*o,Math.max(s.ex*r,Math.abs(i.px))),oy:ja(i.oy,i.oy-t*a,Math.max(s.ey*r,Math.abs(i.py)))}}function qc(i,e,t,n,s,r){let o=Gc(i.zoom*e,Math.min(r.zMin,i.zoom),Math.max(r.zMax,i.zoom));if(Math.abs(o-i.zoom)<1e-9)return i;let a=1/i.zoom-1/o,l=Ud(o),c=Math.min(1,o/i.zoom);return{...i,zoom:o,ox:ja(i.ox,i.ox+t*i.s*s*a,Math.max(r.ex*l,Math.abs(i.px)),c),oy:ja(i.oy,i.oy+n*i.s*a,Math.max(r.ey*l,Math.abs(i.py)),c)}}var Px=i=>i<.5?4*i*i*i:1-Math.pow(2-2*i,3)/2;function Fd(i,e,t){if(t>=1)return e;if(t<=0)return i;let n=Px(t),s=(r,o)=>r+(o-r)*n;return{yaw:Or(i.yaw+Or(e.yaw-i.yaw)*n),pitch:s(i.pitch,e.pitch),d:s(i.d,e.d),s:s(i.s,e.s),ox:s(i.ox,e.ox),oy:s(i.oy,e.oy),zoom:Math.exp(s(Math.log(i.zoom),Math.log(e.zoom))),px:e.px,py:e.py}}var Yc=(i,e,t=1e-4)=>Math.abs(Or(i.yaw-e.yaw))<t&&Math.abs(i.pitch-e.pitch)<t,Zc=(i,e,t=1e-6)=>Yc(i,e,t)&&["d","s","ox","oy","zoom"].every(n=>Math.abs(i[n]-e[n])<t),Jc=(i,e)=>i*Math.PI/Math.max(320,e||0);var Dx={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down","+":"in","=":"in","-":"out",_:"out",0:"reset"};function Od(i,e){let t=new Map,n=null,s=null,r=null,o=null,a="",l=()=>i.getBoundingClientRect(),c=()=>{let[x,g]=[...t.values()];return{x:(x.x+g.x)/2,y:(x.y+g.y)/2,dist:Math.hypot(x.x-g.x,x.y-g.y)}};function h(x){if(a=x.pointerType,x.pointerType==="mouse"){if(x.button!==0&&x.button!==2)return;s={id:x.pointerId,x:x.clientX,y:x.clientY,pan:x.button===2};try{i.setPointerCapture(x.pointerId)}catch{}i.dataset.drag="",e.start();return}t.set(x.pointerId,{x:x.clientX,y:x.clientY,x0:x.clientX,y0:x.clientY,t0:x.timeStamp}),t.size===1?n="wait":t.size===2&&n!=="done"&&(n="pinch",r=c(),e.start())}function u(x){if(x.pointerType==="mouse"){if(!s||x.pointerId!==s.id)return;let w=x.clientX-s.x,P=x.clientY-s.y;s.x=x.clientX,s.y=x.clientY,(w||P)&&(s.pan||x.shiftKey?e.pan(w,P):e.rotate(w,P));return}let g=t.get(x.pointerId);if(!g)return;let R=g.x,T=g.y;if(g.x=x.clientX,g.y=x.clientY,n==="wait"){let w=g.x-g.x0,P=g.y-g.y0;if(Math.hypot(w,P)<8)return;Math.abs(w)>Math.abs(P)?(n="rotate",e.start(),e.rotate(w,P)):n="scroll";return}if(n==="rotate"&&t.size===1)e.rotate(g.x-R,g.y-T);else if(n==="pinch"&&t.size===2){let w=c(),P=l();w.dist>0&&r.dist>0&&e.zoom(w.dist/r.dist,w.x-P.left,w.y-P.top),e.pan(w.x-r.x,w.y-r.y),r=w}}function f(x){if(x.pointerType==="mouse"){s&&x.pointerId===s.id&&(s=null,delete i.dataset.drag);return}let g=t.get(x.pointerId);g&&(t.delete(x.pointerId),x.type==="pointerup"&&n==="wait"&&!t.size&&x.timeStamp-g.t0<350&&(o&&x.timeStamp-o.t<400&&Math.hypot(g.x-o.x,g.y-o.y)<30?(o=null,e.start(),e.reset()):o={t:x.timeStamp,x:g.x,y:g.y}),t.size?(n==="pinch"||n==="rotate")&&(n="done"):(n=null,r=null))}let p=x=>{x.cancelable&&(x.touches.length>=2||n==="rotate"||n==="pinch"||n==="done")&&x.preventDefault()};function _(x){let g=x.deltaY*(x.deltaMode===1?16:x.deltaMode===2?400:1),R=l();(g!==0&&e.zoom(Math.exp(-g*(x.ctrlKey?.01:.0015)),x.clientX-R.left,x.clientY-R.top)||x.ctrlKey)&&x.preventDefault()}let y=x=>{a==="mouse"&&(x.preventDefault(),e.start(),e.reset())},m=x=>x.preventDefault();function d(x){if(x.altKey||x.ctrlKey||x.metaKey)return;let g=Dx[x.key];g&&(x.preventDefault(),e.key(g))}let b=[["pointerdown",h],["pointermove",u],["pointerup",f],["pointercancel",f],["lostpointercapture",f],["dblclick",y],["contextmenu",m],["keydown",d]];for(let[x,g]of b)i.addEventListener(x,g);return i.addEventListener("touchmove",p,{passive:!1}),i.addEventListener("wheel",_,{passive:!1}),()=>{for(let[x,g]of b)i.removeEventListener(x,g);i.removeEventListener("touchmove",p,{passive:!1}),i.removeEventListener("wheel",_,{passive:!1}),t.clear(),s=null}}var on=!1,Is=!1,Ux=40,Nx=48,Fx=3,Ps=[],nl={antialias:!0,alpha:!1,powerPreference:"low-power"};function sl(i){try{i.release?.()}catch{}i.renderer.dispose?.(),i.renderer.forceContextLoss?.()}function Wd(){for(;Ps.length;){let n=Ps.pop();if(!n.renderer.getContext?.()?.isContextLost?.())return n;sl(n)}let i=document.createElement("canvas"),e=null,t=null;try{t=i.getContext("webgl2",nl),t&&(e=new Pr({canvas:i,context:t,...nl}),e.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)))}catch{e=null}return e?{renderer:e,canvas:i,release:null}:(t?.getExtension("WEBGL_lose_context")?.loseContext(),null)}function Xd(i){Ps.length>=Fx?sl(i):Ps.push(i)}var il=12,Xn=new Map,qd="podhod.volume-bounds.v1",Ox=256,Bd=!1,zd=0,Qc=()=>window.PODHOD_BUILD||null;function Yd(i){let e=2166136261,t=16777619;for(let n=0;n<i.length;n++){let s=i.charCodeAt(n);e=Math.imul(e^s,16777619),t=Math.imul(t^s,1540483477)^t>>>15}return(e>>>0).toString(36)+(t>>>0).toString(36)}var Bx=i=>i&&typeof i=="object"&&Object.entries(i).every(([e,t])=>e==="_view"||t&&["minX","maxX","minY","maxY"].every(n=>Number.isFinite(t[n])));function Zd(i){if(!Bd){Bd=!0;try{let e=JSON.parse(localStorage.getItem(qd)||"null");if(e&&e.build&&e.build===Qc())for(let[t,n]of Object.entries(e.bounds||{}))!Xn.has(t)&&Bx(n)&&Xn.set(t,n)}catch{}}return Xn.get(i)||null}function Jd(i,e){for(Xn.delete(i),Xn.set(i,e);Xn.size>Ox;)Xn.delete(Xn.keys().next().value);Qc()&&(clearTimeout(zd),zd=setTimeout(()=>{try{localStorage.setItem(qd,JSON.stringify({build:Qc(),bounds:Object.fromEntries(Xn)}))}catch{}},1500))}var fi=i=>Math.round(i*1e4)/1e4,$c=()=>typeof performance<"u"?performance.now():Date.now(),zx=()=>typeof matchMedia=="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches,kd=null,kx=()=>kd||(kd={fov:28,pad:1.13,settings:Fr}),Hx=240,$d=0;function Kd(i,e,t,n){if(!e||!n.body||!globalThis.Skeleton?.frames)return;i.data!==e&&(i.map.clear(),i.data=e);let s=i.map.get(t);s||($d++,s=globalThis.Skeleton.frames(n.pose,n.body,e.bones),i.map.size>=Hx&&i.map.delete(i.map.keys().next().value),i.map.set(t,s)),n.boneFrames=s}function Hd(i,e){if(i===e)return!0;if(!i||!e||i.skeleton!==e.skeleton||i.muscles!==e.muscles)return!1;let t=i.level||{},n=e.level||{},s=Object.keys(t);return s.length!==Object.keys(n).length?!1:s.every(r=>t[r]===n[r])}function Vx(i){if(i.share?.linkView){let C=i.share.linkView(i);if(C)return C}if(on)return null;if(typeof window.WebGL2RenderingContext>"u")return on=!0,null;let e=document.createElement("div");e.className="fig volume-figure",e.setAttribute("role","img"),e.setAttribute("aria-label",i.label),e.dataset.camera=i.camera||"above";let t=Wd();if(!t)return on=!0,null;e.dataset.renderer="webgl";let{renderer:n,canvas:s}=t,r=t.release,o=kx();t.release=null;let a=(C,Z,j=!1)=>i.data(C,Z,!1,j),l=a(0,0),c=Ka(l),h=c.cameras;e.append(n.domElement);let u=!1,f=i.t||0,p=0,_="all",y=i.muscles!==!1,m=!!i.joints,d=i.stress!==!1,b=null,x=null;if(!h[i.camera||"above"])throw Error("Unknown volume camera "+i.camera);let g=()=>{},R=i.memoBones?{map:new Map,data:null}:null,T=!1,w=!1,P=()=>{let C=globalThis.AnnySkin;T||!C||C.data||(T=!0,C.load().then(()=>{u||(!b&&!x?ae(f,{index:p}):v())},()=>{}))},S=C=>typeof requestIdleCallback=="function"?requestIdleCallback(C,{timeout:3e3}):setTimeout(C,200);function v(){let C=globalThis.AnnySkin;if(w||u||!C?.data||!(b||x)||!n.compileAsync||!c.anny)return;w=!0;let Z=()=>!u&&(b||x)&&!n.getContext?.()?.isContextLost?.();S(()=>{if(Z()){try{let j=a(f,p,!1);c.anny.update(C.data,j,{on:y,color:i.color,values:j.values,sideValues:j.sideValues,regions:j.regions,selected:_}),c.anny.hide()}catch{return}Promise.all([n.compileAsync(c.scene,h.angle),E(c.anny.mesh)]).then(()=>S(()=>{if(!Z()||!n.setViewport)return;let j=c.anny.group,Y=n.render.perfOrig||n.render;j.visible=!0;try{n.setViewport(0,0,1,1),n.setScissor(0,0,1,1),n.setScissorTest(!0),Y.call(n,c.scene,h.angle)}catch{}finally{n.setScissorTest(!1),j.visible=!1,Fe||n.setViewport(0,0,ne.w,ne.h)}oe()}),()=>{})}})}function E(C){let Z=C?.customDepthMaterial;if(!Z||!C.castShadow||!n.shadowMap?.enabled||!n.setRenderTarget||!n.compileAsync)return Promise.resolve();let j={[Vt]:Mt,[Mt]:Vt,[Pt]:Pt};Z.side=C.material.shadowSide??j[C.material.side];let Y=new Fn,te=new Ke(C.geometry,Z);te.frustumCulled=!1,te.receiveShadow=C.receiveShadow,te.morphTargetInfluences=C.morphTargetInfluences,Y.add(te);let Ee=new hn(1,1),F=n.getRenderTarget(),re;try{n.setRenderTarget(Ee),re=n.compileAsync(Y,h.angle,c.scene)}catch{re=Promise.resolve()}finally{n.setRenderTarget(F)}return re.catch(()=>{}).then(()=>Ee.dispose())}let L=()=>{!b&&!x&&P()},B=(C,Z,j=!1)=>{let Y=a(C,Z,!!(b||x));R&&Kd(R,x?.skeleton||b,C,Y),c.apply(Y,{color:i.color,selected:_,muscles:y,joints:m,stress:d,skeleton:b,anatomy:x},{shape:j}),g(C,Z,Y.pose),L()},q=new Ei(new it().setFromPoints(i.trace.map(C=>new U(...zt(C)))),new On({color:"#b4c3d9",transparent:!0,opacity:.7}));q.visible=!1,c.scene.add(q);let z=new ot;z.name="movement-vectors",z.visible=!1,c.scene.add(z);for(let C of i.vectors){let Z=new U(...zt(C.a)),j=new U(...zt(C.b)),Y=j.clone().sub(Z);z.add(new Sr(Y.clone().normalize(),Z,Y.length(),/^(sh|hip)$/.test(C.key)?7842259:15298901,.075,.035))}g=(C,Z,j)=>{i.vectors.forEach((Y,te)=>{let Ee=i.vectorFrame?i.vectorFrame(Y,C,Z,j):Y,F=z.children[te];if(F.visible=!!Ee,!Ee)return;let re=new U(...zt(Ee.a)),ve=new U(...zt(Ee.b)),Ae=ve.sub(re);F.position.copy(re),F.setDirection(Ae.clone().normalize()),F.setLength(Ae.length(),.06,.03)}),z.updateMatrixWorld(!0)};let V=l.exerciseId+"|"+Yd(JSON.stringify([l.props,i.vectors])),$=Zd(V),G=null;if($&&Object.keys(c.bounds).every(C=>$[C])&&Id($._view,o)){for(let C of Object.keys(c.bounds))Object.assign(c.bounds[C],$[C]);G=$._view}else{let C=Cd(Fr,o);for(let Z=0;Z<=il;Z++)B(Z/il,0,!0),c.includeBounds(void 0,C.add);G=C.data(),Jd(V,{...Object.fromEntries(Object.entries(c.bounds).map(([Z,j])=>[Z,{minX:fi(j.minX),maxX:fi(j.maxX),minY:fi(j.minY),maxY:fi(j.maxY)}])),...G?{_view:G}:{}})}i.layers?(B(f,0,!0),c.studio?.(n),b=i.layers.bones||null,x=i.layers.body||null,e.dataset.skeleton=b?"on":"off",e.dataset.anatomy=x?"on":"off",P(),B(f,0)):(B(f,0),c.studio?.(n)),Is&&c.setShadows?.(!1),globalThis.GymPerf?.volume({scene:c,renderer:n,options:i,root:e,low:()=>Is});let ue=[],me=0;function Se(){let C=typeof performance<"u"?performance.now():Date.now(),Z=C-me;if(me=C,Is||!(Z>0&&Z<200)||(ue.push(Z),ue.length<Ux))return;let j=ue.sort((Y,te)=>Y-te)[ue.length>>1];if(ue.length=0,j>Nx){Is=!0,c.setShadows?.(!1);for(let Y of Me)Y.root.dataset.quality="low"}}let Me=[],Fe=!1;function Ze(C,Z,j){let Y=j.interactive&&G?{cam:new Rt(28,1,.05,40),aspect:j.ratio||1.15,v:null,go:null,free:!1,user:!1,basis:new Qe,R:new U,U:new U,B:new U}:null,te={root:C,camera:Z,o:j,orbit:Y,canvas:null,ctx:null,w:0,h:0,stale:!0,pending:0,dirty:!1,drawnAt:-1,closed:!1,detach:null,observer:null},Ee=we=>Pd(G,we,Y.aspect,o);Y&&(Y.v=Ee(Z),C.dataset.orbit="",C.dataset.free="0",C.tabIndex=0),te.viewNow=()=>{let we=Y.go;if(!we)return Y.v;let be=($c()-we.t0)/we.ms;return be<1?Fd(we.from,we.to,be):(Y.v=we.to,Y.go=null,Y.v)};let F=()=>{Y?.go&&(Y.v=te.viewNow(),Y.go=null)};te.place=()=>{let we=te.viewNow(),be=Xc(G,we,Y.aspect,o),Je=Y.cam;Je.position.fromArray(be.position),Je.quaternion.setFromRotationMatrix(Y.basis.makeBasis(Y.R.fromArray(be.right),Y.U.fromArray(be.up),Y.B.fromArray(be.back))),Je.isPerspectiveCamera?(Je.fov=be.fov,Je.aspect=Y.aspect):(Je.left=-be.half[0],Je.right=be.half[0],Je.top=be.half[1],Je.bottom=-be.half[1]),Je.near=be.near,Je.far=be.far,Je.zoom=be.zoom,Je.updateProjectionMatrix()},te.schedule=()=>{!u&&!te.closed&&!te.pending&&typeof requestAnimationFrame=="function"&&(te.pending=requestAnimationFrame(re))};function re(we){te.pending=0,!(u||te.closed)&&(te.dirty||Y?.go&&te.drawnAt<we?ie(te):Y?.go&&te.schedule())}let ve=()=>{te.dirty=!0,te.schedule()};function Ae(){let we=Y.go?Y.go.to:Y.v,be=!Yc(we,el(Fr,te.camera));if(be!==Y.free){Y.free=be,C.dataset.free=be?"1":"0";try{j.onCamera?.({camera:te.camera,free:be})}catch(Je){console.error(Je)}}}let fe=we=>Ld(G,we,Y.aspect,o);function le(we){if(u||te.closed||!Y)return!1;F();let be=Y.v,Je=we(be);if(Je===be||Zc(Je,be))return!1;Y.v=Je,Y.user=!0,Ae(),ve();try{j.onGesture?.()}catch{}return!0}function Ie(we,be){F(),be>0&&!zx()?Y.go={from:Y.v,to:we,t0:$c(),ms:be}:Y.v=we,Ae(),ve()}te.reset=()=>{!Y||u||te.closed||(Y.user=!1,Ie(Ee(te.camera),Hc))},te.aspect=we=>{if(Y&&(Y.aspect=we,!Y.user)){let be=Ee(te.camera);Y.go?Y.go.to=be:Y.v=be}},te.setCamera=(we,be={})=>u||te.closed||!h[we]?!1:(te.camera=we,C.dataset.camera=we,Y?(Y.user=!1,Ie(Ee(we),be.instant?0:Hc),!0):(ie(te),!0));let ze=()=>{let we=C.getBoundingClientRect();return[Math.max(1,we.width),Math.max(1,we.height)]};return te.detach=Y?Od(C,{start:F,rotate:(we,be)=>{let[Je]=ze();return le(xt=>tl(xt,Jc(we,Je),Jc(be,Je)*.8,fe(xt)))},pan:(we,be)=>{let[Je,xt]=ze();return le(bn=>Nd(bn,2*we/Je,-2*be/xt,Y.aspect,fe(bn)))},zoom:(we,be,Je)=>{let[xt,bn]=ze();return le(pn=>qc(pn,we,2*be/xt-1,1-2*Je/bn,Y.aspect,fe(pn)))},reset:()=>{te.reset();try{j.onGesture?.()}catch{}},key(we){if(we==="reset"){te.reset();return}let be=Y.go?Y.go.to:Y.v,Je=fe(be),xt=Math.PI/180,bn=we==="left"||we==="right"?tl(be,(we==="left"?-1:1)*wd*xt,0,Je):we==="up"||we==="down"?tl(be,0,(we==="up"?1:-1)*Td*xt,Je):qc(be,we==="in"?Vc:1/Vc,0,0,Y.aspect,Je);if(!Zc(bn,be)){Y.user=!0,Ie(bn,Ed);try{j.onGesture?.()}catch{}}}}):null,te.close=()=>{te.closed||(te.closed=!0,te.pending&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(te.pending),te.pending=0,te.detach?.(),te.observer?.disconnect())},te}let Ye=!1;function ie(C){if(u||C.closed)return;if(C.stale&&xe){if(!C.root.isConnected){C.dirty=!0;return}Xe()}C.dirty=!1,C.drawnAt=$c();let Z=C.orbit;Z&&(C.place(),Z.go&&C.schedule());let j=Z?Z.cam:h[C.camera];if(!Fe)n.render(c.scene,j);else{if(n.getContext?.()?.isContextLost?.())return;n.setViewport(0,0,C.w,C.h),n.setScissor(0,0,C.w,C.h),n.setScissorTest(!0);try{n.render(c.scene,j)}finally{n.setScissorTest(!1)}let Y=C.canvas;C.ctx&&Y.width&&Y.height&&C.ctx.drawImage(s,0,s.height-Y.height,Y.width,Y.height,0,0,Y.width,Y.height)}if(!Ye){Ye=!0;try{r?.()}catch{}}}function oe(){let C=n.shadowMap,Z=C?.autoUpdate,j=!0;try{for(let Y of Me)Y.closed||(!j&&C?.enabled&&(C.autoUpdate=!1,C.needsUpdate=!1),ie(Y),j=!1)}finally{C&&(C.autoUpdate=Z)}}function Ce(C){let Z=C.root.getBoundingClientRect(),j=Math.max(1,Math.min(1100,Z.width||620)),Y=Math.max(1,Math.round(Z.height||j/(C.o.ratio||1.15))),te=C.stale;if(C.stale=!C.root.isConnected,C.w===j&&C.h===Y)return te&&!C.stale;if(C.w=j,C.h=Y,C.aspect(j/Y),C.canvas){let Ee=n.getPixelRatio?.()||1,F=Math.floor(j*Ee),re=Math.floor(Y*Ee);C.canvas.width!==F&&(C.canvas.width=F),C.canvas.height!==re&&(C.canvas.height=re)}return!0}let Le=new _e,Pe=!1;function Xe(){let C=!Pe;Pe=!0;for(let j of Me)!j.closed&&Ce(j)&&(C=!0);let Z=Me[0];if(!Fe)(C||!n.getSize)&&n.setSize(Z.w,Z.h);else{let j=1,Y=1;for(let te of Me)te.closed||(j=Math.max(j,te.w),Y=Math.max(Y,te.h));n.getSize?.(Le),(Le.x!==j||Le.y!==Y)&&(n.setSize(j,Y,!1),C=!0)}return(C||!n.getSize)&&c.resize(Z.w,Z.h),C}function et(C){u||(Xe()||C===!0||!n.getSize)&&oe()}function N(){if(Fe)return;Fe=!0;let C=Me[0];C.canvas=document.createElement("canvas"),C.ctx=C.canvas.getContext?.("2d",{alpha:!1})||null,s.parentNode===e?e.replaceChild(C.canvas,s):e.append(C.canvas),C.w=C.h=0}let ce=()=>{for(let C of Me)C.closed||(C.root.dataset.pose=String(f),C.root.dataset.phase=String(p))};function ae(C,Z){u||(f=C,p=Z?.index||0,B(C,p),ce(),oe(),Se())}let ne=Ze(e,i.camera||"above",i);Me.push(ne);let se=()=>{u||(B(f,p),et(!0))};s.addEventListener("webglcontextrestored",se);let xe=typeof ResizeObserver=="function";ne.observer=xe?new ResizeObserver(et):null,ne.observer?.observe(e),et();let he=()=>ae(f,{index:p}),ye=C=>{y!==!!C&&(y=!!C,he())},Ge=C=>{_!==C&&(_=C,he())},Be=C=>{m!==!!C&&(m=!!C,he())},D=C=>{d!==!!C&&(d=!!C,he())},M=()=>{for(let C of Me)C.root.dataset.skeleton=b?"on":"off",C.root.dataset.anatomy=x?"on":"off"},I=C=>{C=C||null,!(b===C&&ne.root.dataset.skeleton)&&(b=C,M(),he())},O=C=>{C=C||null,!(Hd(x,C)&&ne.root.dataset.anatomy)&&(x=C,M(),he())},H=(C,Z)=>{C=C||null,Z=Z||null,!(b===C&&Hd(x,Z)&&ne.root.dataset.skeleton&&ne.root.dataset.anatomy)&&(b=C,x=Z,M(),he())},k=C=>{q.visible!==!!C&&(q.visible=!!C,oe())},J=C=>{z.visible!==!!C&&(z.visible=!!C,oe())};ae(f,{index:p}),(b||x)&&v();function ee(){if(!u){u=!0;for(let C of Me)C.close();s.removeEventListener("webglcontextrestored",se),c.disposeGeometry(),t.release=Ye||!r?c.disposeMaterials:()=>{try{r()}catch{}c.disposeMaterials()},Xd(t)}}function de(C,Z){return{svg:C.root,at:Z?(j,Y)=>{u||C.closed||j===f&&(Y?.index||0)===p||ae(j,Y)}:ae,get camera(){return C.camera},setCamera:(j,Y)=>C.setCamera(j,Y),setMuscles:ye,setRegion:Ge,setJoints:Be,setStress:D,setSkeleton:I,setAnatomy:O,setLayers:H,setTrace:k,setVectors:J,get orbit(){return!!C.orbit},get free(){return!!C.orbit?.free},resetCamera:()=>C.reset(),cameraState:()=>C.orbit?{...C.viewNow(),aspect:C.orbit.aspect,free:C.orbit.free,moving:!!C.orbit.go,camera:C.camera}:null,projectWorld:j=>C.orbit?Dd(G,C.viewNow(),C.orbit.aspect,j,o):null,dispose:Z?()=>{C.close();let j=Me.indexOf(C);j>0&&Me.splice(j,1)}:ee,...Z?{linked:!0}:{linkView:pe}}}function pe(C){if(u||!G||!C.interactive||!h[C.camera||"above"])return null;let Z=document.createElement("div");Z.className="fig volume-figure",Z.setAttribute("role","img"),Z.setAttribute("aria-label",C.label),Z.dataset.camera=C.camera||"above",Z.dataset.renderer="webgl",N();let j=Ze(Z,C.camera||"above",C);return j.canvas=document.createElement("canvas"),j.ctx=j.canvas.getContext?.("2d",{alpha:!1})||null,Z.append(j.canvas),Me.push(j),ce(),ne.root.dataset.skeleton&&M(),Is&&(Z.dataset.quality="low"),j.observer=xe?new ResizeObserver(et):null,j.observer?.observe(Z),et(!0),de(j,!0)}return de(ne,!1)}var Gx=3,Wx=!1,Vd=1.1;function Xx(){let i=null,e=0,t=0,n=0,s=0,r=new Map,o=[],a={apply:0,render:0,copy:0},l=()=>typeof performance<"u"?performance.now():Date.now();function c(){for(let m of r.values())p(m,!0);r.clear();for(let m of o.splice(0))try{m()}catch{}i&&(i.canvas.removeEventListener("webglcontextrestored",h),sl(i),i=null),e=t=0}function h(){for(let m of r.values())p(m,!0);r.clear(),e=t=0}function u(){if(i)return i;if(on)return null;if(typeof window.WebGL2RenderingContext>"u")return on=!0,null;let m=document.createElement("canvas"),d=null,b=null;try{b=m.getContext("webgl2",nl),b&&(d=new Pr({canvas:m,context:b,...nl}),d.setPixelRatio(1))}catch{d=null}return d?(i={renderer:d,canvas:m,release:null},m.addEventListener("webglcontextrestored",h),i):(b?.getExtension?.("WEBGL_lose_context")?.loseContext(),on=!0,null)}function f(m,d){let b=(S,v,E)=>d.data(S,v,!1,E),x=b(0,0,!0),g=Ka(x),R=d.fit==="body"?"body":"all",T=!!d.still,w=x.exerciseId+"|"+Yd(JSON.stringify([x.props,[]]))+"|"+R,P=T?null:Zd(w);if(!T)if(P&&Object.keys(g.bounds).every(S=>P[S]))for(let S of Object.keys(g.bounds))Object.assign(g.bounds[S],P[S]);else{for(let S=0;S<=il;S++)g.apply(b(S/il,0,!0),{color:d.color}),g.includeBounds(R==="body"?"body":void 0);Jd(w,Object.fromEntries(Object.entries(g.bounds).map(([S,v])=>[S,{minX:fi(v.minX),maxX:fi(v.maxX),minY:fi(v.minY),maxY:fi(v.maxY)}])))}return g.studio?.(i.renderer),Wx||g.setShadows?.(!1),s++,globalThis.GymPerf?.volume({scene:g,renderer:i.renderer,options:d,root:null,card:!0}),{key:m,scene:g,data:b,color:d.color,applied:null,aspect:0,bones:{map:new Map,data:null},still:T,fit:R,framed:null}}function p(m,d){try{m.scene.disposeGeometry()}catch{}if(d)try{m.scene.disposeMaterials()}catch{}else o.push(m.scene.disposeMaterials)}function _(m,d){let b=r.get(m);if(b)return r.delete(m),r.set(m,b),b;b=f(m,d),r.set(m,b);for(let[x,g]of r){if(r.size<=Gx)break;g!==b&&(r.delete(x),p(g,!1))}return b}function y(m){let d=null,b=null,x=m.muscles!==!1,g=m.stress!==!1,R=!1,T=()=>(d?"b":"")+(b?"a"+Object.entries(b.level||{}).map(([w,P])=>w+P).join(","):"")+(x?"m":"")+(g?"s":"");return{key:m.key,setLayers(w,P){d=w||null,b=P||null},setLook(w){"muscles"in w&&(x=!!w.muscles),"stress"in w&&(g=!!w.stress)},paint(w,P,S,v="above"){if(R||!w?.width||!w?.height)return!1;let E=u();if(!E||E.renderer.getContext?.()?.isContextLost?.())return!1;let L=_(m.key,m),B=L.scene.cameras[v]||L.scene.cameras.above;(e!==w.width||t!==w.height)&&(e=w.width,t=w.height,E.renderer.setSize(e,t,!1)),!L.still&&L.aspect!==e/t&&(L.aspect=e/t,L.scene.resize(e,t,Vd));let q=P+"|"+(S||0)+"|"+T(),z=l();if(L.applied!==q){let Se=L.data(P,S||0,!!(d||b));Kd(L.bones,b?.skeleton||d,P,Se),L.scene.apply(Se,{color:L.color,selected:"all",muscles:x,joints:!1,stress:g,skeleton:d,anatomy:b}),L.applied=q}let V=q+"|"+e/t;if(L.still&&L.framed!==V){for(let Se of Object.values(L.scene.bounds))Object.assign(Se,{minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0});L.scene.includeBounds(L.fit==="body"?"body":void 0),L.scene.resize(e,t,Vd),L.framed=V,L.aspect=e/t}let $=l();E.renderer.render(L.scene.scene,B),n++;let G=l(),ue=w.getContext("2d");if(!ue)return!1;ue.drawImage(E.canvas,0,0,e,t),a.apply=$-z,a.render=G-$,a.copy=l()-G;let me=globalThis.GymPerf;me&&!L.still&&me.card?.(a.apply+a.render+a.copy,a.copy);for(let Se of o.splice(0))try{Se()}catch{}return!0},prepare(){if(R)return!1;let w=u();return!w||w.renderer.getContext?.()?.isContextLost?.()?!1:(_(m.key,m),!0)},forget(){R=!0;let w=r.get(m.key);w&&(r.delete(m.key),p(w,!1))},release(){R=!0}}}return{figure:y,dispose:c,stats:()=>({scenes:r.size,renders:n,builds:s,context:!!i,size:[e,t],timing:{...a}}),get builds(){return s},get available(){return!on}}}var Kc=null;function qx(){return!on&&typeof window.WebGL2RenderingContext>"u"&&(on=!0),on?null:(Kc||(Kc=Xx()),Kc)}var Gd=!1;function Yx(i){if(Gd||on||Ps.length)return Promise.resolve(!1);if(typeof window.WebGL2RenderingContext>"u")return on=!0,Promise.resolve(!1);Gd=!0;let e=Wd();if(!e)return on=!0,Promise.resolve(!1);let{renderer:t}=e,n=i.layers||null,s;try{s=Ka(i.data(0,0,!1,!1));let l={color:i.color,selected:"all",muscles:i.muscles!==!1,joints:!!i.joints,stress:i.stress!==!1},c=h=>{let u=i.data(i.t||0,0,!1,h);return u.poseKey=null,u};n&&globalThis.AnnySkin?.data&&s.apply(c(!1),{...l,skeleton:null,anatomy:null}),s.apply(c(!!n),{...l,skeleton:n?.bones||null,anatomy:n?.body||null}),s.studio?.(t),Is&&s.setShadows?.(!1)}catch{return sl(e),Promise.resolve(!1)}let r=s.cameras.angle;s.resize(1,1),t.setSize(1,1,!1),e.release=s.dispose,Xd(e);let o=l=>typeof requestIdleCallback=="function"?requestIdleCallback(l,{timeout:2e3}):setTimeout(l,50),a=()=>Ps.includes(e)&&!t.getContext?.()?.isContextLost?.();return new Promise(l=>o(()=>{if(!a()){l(!1);return}(t.compileAsync?t.compileAsync(s.scene,r):Promise.resolve()).then(()=>o(()=>{if(a())try{t.render(s.scene,r)}catch{}l(a())}),()=>l(!1))}))}window.GymVolume={create:Vx,cards:qx,prewarm:Yx,get boneMisses(){return $d+ud().misses}};})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
