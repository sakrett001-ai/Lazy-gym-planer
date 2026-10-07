(()=>{var Gl=0,Eo=1,Wl=2;var To=1,Xl=2,un=3,Mn=0,wt=1,qt=2,En=0,ei=1,wo=2,Ao=3,Ro=4,ql=5,Fn=100,Yl=101,Zl=102,Jl=103,$l=104,Kl=200,Ql=201,jl=202,ec=203,rr=204,ar=205,tc=206,nc=207,ic=208,sc=209,rc=210,ac=211,oc=212,lc=213,cc=214,zr=0,kr=1,Vr=2,ti=3,Hr=4,Gr=5,Wr=6,Xr=7,qr=0,hc=1,uc=2,Tn=0,dc=1,fc=2,pc=3,mc=4,gc=5,_c=6,xc=7;var Co=300,ci=301,hi=302,Yr=303,Zr=304,Ms=306,or=1e3,Nn=1001,lr=1002,Gt=1003,vc=1004;var Ss=1005;var en=1006,Jr=1007;var Wn=1008;var rn=1009,Io=1010,Po=1011,Fi=1012,$r=1013,Xn=1014,dn=1015,Oi=1016,Kr=1017,Qr=1018,Bi=1020,Lo=35902,Do=35899,Uo=1021,No=1022,Yt=1023,Ii=1026,zi=1027,Fo=1028,jr=1029,Oo=1030,ea=1031;var ta=1033,bs=33776,Es=33777,Ts=33778,ws=33779,na=35840,ia=35841,sa=35842,ra=35843,aa=36196,oa=37492,la=37496,ca=37808,ha=37809,ua=37810,da=37811,fa=37812,pa=37813,ma=37814,ga=37815,_a=37816,xa=37817,va=37818,ya=37819,Ma=37820,Sa=37821,ba=36492,Ea=36494,Ta=36495,wa=36283,Aa=36284,Ra=36285,Ca=36286;var ji=2300,cr=2301,sr=2302,go=2400,_o=2401,xo=2402;var yc=3200,Mc=3201;var Bo=0,Sc=1,wn="",Ft="srgb",ni="srgb-linear",es="linear",$e="srgb";var jn=7680;var vo=519,bc=512,Ec=513,Tc=514,zo=515,wc=516,Ac=517,Rc=518,Cc=519,yo=35044;var ko="300 es",jt=2e3,ts=2001;var Sn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ka=Math.PI/180,hr=180/Math.PI;function As(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(yt[i&255]+yt[i>>8&255]+yt[i>>16&255]+yt[i>>24&255]+"-"+yt[e&255]+yt[e>>8&255]+"-"+yt[e>>16&15|64]+yt[e>>24&255]+"-"+yt[t&63|128]+yt[t>>8&255]+"-"+yt[t>>16&255]+yt[t>>24&255]+yt[n&255]+yt[n>>8&255]+yt[n>>16&255]+yt[n>>24&255]).toLowerCase()}function Ge(i,e,t){return Math.max(e,Math.min(t,i))}function xh(i,e){return(i%e+e)%e}function Va(i,e,t){return(1-t)*i+t*e}function Xi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ct(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Le=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ge(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},tn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],h=n[s+2],d=n[s+3],f=r[a+0],p=r[a+1],g=r[a+2],x=r[a+3];if(o===0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d;return}if(o===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=x;return}if(d!==x||c!==f||l!==p||h!==g){let m=1-o,u=c*f+l*p+h*g+d*x,T=u>=0?1:-1,b=1-u*u;if(b>Number.EPSILON){let R=Math.sqrt(b),A=Math.atan2(R,u*T);m=Math.sin(m*A)/R,o=Math.sin(o*A)/R}let S=o*T;if(c=c*m+f*S,l=l*m+p*S,h=h*m+g*S,d=d*m+x*S,m===1-o){let R=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=R,l*=R,h*=R,d*=R}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],h=n[s+3],d=r[a],f=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*d+c*p-l*f,e[t+1]=c*g+h*f+l*d-o*p,e[t+2]=l*g+h*p+o*f-c*d,e[t+3]=h*g-o*d-c*f-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(s/2),d=o(r/2),f=c(n/2),p=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=f*h*d+l*p*g,this._y=l*p*d-f*h*g,this._z=l*h*g+f*p*d,this._w=l*h*d-f*p*g;break;case"YXZ":this._x=f*h*d+l*p*g,this._y=l*p*d-f*h*g,this._z=l*h*g-f*p*d,this._w=l*h*d+f*p*g;break;case"ZXY":this._x=f*h*d-l*p*g,this._y=l*p*d+f*h*g,this._z=l*h*g+f*p*d,this._w=l*h*d-f*p*g;break;case"ZYX":this._x=f*h*d-l*p*g,this._y=l*p*d+f*h*g,this._z=l*h*g-f*p*d,this._w=l*h*d+f*p*g;break;case"YZX":this._x=f*h*d+l*p*g,this._y=l*p*d+f*h*g,this._z=l*h*g-f*p*d,this._w=l*h*d-f*p*g;break;case"XZY":this._x=f*h*d-l*p*g,this._y=l*p*d-f*h*g,this._z=l*h*g+f*p*d,this._w=l*h*d+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],d=t[10],f=n+o+d;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(h-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+h)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ge(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-s*o,this._w=a*h-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let c=1-o*o;if(c<=Number.EPSILON){let p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let l=Math.sqrt(c),h=Math.atan2(l,o),d=Math.sin((1-t)*h)/l,f=Math.sin(t*h)/l;return this._w=a*d+this._w*f,this._x=n*d+this._x*f,this._y=s*d+this._y*f,this._z=r*d+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(xl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(xl.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),h=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+c*l+a*d-o*h,this.y=n+c*h+o*l-r*d,this.z=s+c*d+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ha.copy(this).projectOnVector(e),this.sub(Ha)}reflect(e){return this.sub(Ha.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Ge(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ha=new I,xl=new tn,ze=class i{constructor(e,t,n,s,r,a,o,c,l){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],d=n[7],f=n[2],p=n[5],g=n[8],x=s[0],m=s[3],u=s[6],T=s[1],b=s[4],S=s[7],R=s[2],A=s[5],P=s[8];return r[0]=a*x+o*T+c*R,r[3]=a*m+o*b+c*A,r[6]=a*u+o*S+c*P,r[1]=l*x+h*T+d*R,r[4]=l*m+h*b+d*A,r[7]=l*u+h*S+d*P,r[2]=f*x+p*T+g*R,r[5]=f*m+p*b+g*A,r[8]=f*u+p*S+g*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=h*a-o*l,f=o*c-h*r,p=l*r-a*c,g=t*d+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=d*x,e[1]=(s*l-h*n)*x,e[2]=(o*n-s*a)*x,e[3]=f*x,e[4]=(h*t-s*c)*x,e[5]=(s*r-o*t)*x,e[6]=p*x,e[7]=(n*c-l*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ga.makeScale(e,t)),this}rotate(e){return this.premultiply(Ga.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ga.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ga=new ze;function Vo(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ns(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ic(){let i=ns("canvas");return i.style.display="block",i}var vl={};function Pi(i){i in vl||(vl[i]=!0,console.warn(i))}function Pc(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var yl=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ml=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function vh(){let i={enabled:!0,workingColorSpace:ni,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===$e&&(s.r=yn(s.r),s.g=yn(s.g),s.b=yn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===$e&&(s.r=Ci(s.r),s.g=Ci(s.g),s.b=Ci(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===wn?es:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Pi("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Pi("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ni]:{primaries:e,whitePoint:n,transfer:es,toXYZ:yl,fromXYZ:Ml,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ft},outputColorSpaceConfig:{drawingBufferColorSpace:Ft}},[Ft]:{primaries:e,whitePoint:n,transfer:$e,toXYZ:yl,fromXYZ:Ml,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ft}}}),i}var Ye=vh();function yn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ci(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var _i,ur=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{_i===void 0&&(_i=ns("canvas")),_i.width=e.width,_i.height=e.height;let s=_i.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=_i}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ns("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=yn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(yn(t[n]/255)*255):t[n]=yn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},yh=0,Li=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:yh++}),this.uuid=As(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Wa(s[a].image)):r.push(Wa(s[a]))}else r=Wa(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Wa(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ur.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Mh=0,Xa=new I,Ot=class i extends Sn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Nn,s=Nn,r=en,a=Wn,o=Yt,c=rn,l=i.DEFAULT_ANISOTROPY,h=wn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mh++}),this.uuid=As(),this.name="",this.source=new Li(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Le(0,0),this.repeat=new Le(1,1),this.center=new Le(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Xa).x}get height(){return this.source.getSize(Xa).y}get depth(){return this.source.getSize(Xa).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Co)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case or:e.x=e.x-Math.floor(e.x);break;case Nn:e.x=e.x<0?0:1;break;case lr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case or:e.y=e.y-Math.floor(e.y);break;case Nn:e.y=e.y<0?0:1;break;case lr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=Co;Ot.DEFAULT_ANISOTROPY=1;var lt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],h=c[4],d=c[8],f=c[1],p=c[5],g=c[9],x=c[2],m=c[6],u=c[10];if(Math.abs(h-f)<.01&&Math.abs(d-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(d+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+u-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let b=(l+1)/2,S=(p+1)/2,R=(u+1)/2,A=(h+f)/4,P=(d+x)/4,U=(g+m)/4;return b>S&&b>R?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=A/n,r=P/n):S>R?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=A/s,r=U/s):R<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),n=P/r,s=U/r),this.set(n,s,r,t),this}let T=Math.sqrt((m-g)*(m-g)+(d-x)*(d-x)+(f-h)*(f-h));return Math.abs(T)<.001&&(T=1),this.x=(m-g)/T,this.y=(d-x)/T,this.z=(f-h)/T,this.w=Math.acos((l+p+u-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this.w=Ge(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this.w=Ge(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ge(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},dr=class extends Sn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:en,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new lt(0,0,e,t),this.scissorTest=!1,this.viewport=new lt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new Ot(s);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:en,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Li(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},cn=class extends dr{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},is=class extends Ot{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var fr=class extends Ot{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var On=class{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint($t.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint($t.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=$t.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,$t):$t.fromBufferAttribute(r,a),$t.applyMatrix4(e.matrixWorld),this.expandByPoint($t);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Fs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Fs.copy(n.boundingBox)),Fs.applyMatrix4(e.matrixWorld),this.union(Fs)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$t),$t.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(qi),Os.subVectors(this.max,qi),xi.subVectors(e.a,qi),vi.subVectors(e.b,qi),yi.subVectors(e.c,qi),Rn.subVectors(vi,xi),Cn.subVectors(yi,vi),Jn.subVectors(xi,yi);let t=[0,-Rn.z,Rn.y,0,-Cn.z,Cn.y,0,-Jn.z,Jn.y,Rn.z,0,-Rn.x,Cn.z,0,-Cn.x,Jn.z,0,-Jn.x,-Rn.y,Rn.x,0,-Cn.y,Cn.x,0,-Jn.y,Jn.x,0];return!qa(t,xi,vi,yi,Os)||(t=[1,0,0,0,1,0,0,0,1],!qa(t,xi,vi,yi,Os))?!1:(Bs.crossVectors(Rn,Cn),t=[Bs.x,Bs.y,Bs.z],qa(t,xi,vi,yi,Os))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$t).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($t).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(mn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),mn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),mn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),mn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),mn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),mn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),mn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),mn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(mn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},mn=[new I,new I,new I,new I,new I,new I,new I,new I],$t=new I,Fs=new On,xi=new I,vi=new I,yi=new I,Rn=new I,Cn=new I,Jn=new I,qi=new I,Os=new I,Bs=new I,$n=new I;function qa(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){$n.fromArray(i,r);let o=s.x*Math.abs($n.x)+s.y*Math.abs($n.y)+s.z*Math.abs($n.z),c=e.dot($n),l=t.dot($n),h=n.dot($n);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var Sh=new On,Yi=new I,Ya=new I,ii=class{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Sh.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Yi.subVectors(e,this.center);let t=Yi.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Yi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ya.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Yi.copy(e.center).add(Ya)),this.expandByPoint(Yi.copy(e.center).sub(Ya))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},gn=new I,Za=new I,zs=new I,In=new I,Ja=new I,ks=new I,$a=new I,ss=class{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,gn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=gn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(gn.copy(this.origin).addScaledVector(this.direction,t),gn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Za.copy(e).add(t).multiplyScalar(.5),zs.copy(t).sub(e).normalize(),In.copy(this.origin).sub(Za);let r=e.distanceTo(t)*.5,a=-this.direction.dot(zs),o=In.dot(this.direction),c=-In.dot(zs),l=In.lengthSq(),h=Math.abs(1-a*a),d,f,p,g;if(h>0)if(d=a*c-o,f=a*o-c,g=r*h,d>=0)if(f>=-g)if(f<=g){let x=1/h;d*=x,f*=x,p=d*(d+a*f+2*o)+f*(a*d+f+2*c)+l}else f=r,d=Math.max(0,-(a*f+o)),p=-d*d+f*(f+2*c)+l;else f=-r,d=Math.max(0,-(a*f+o)),p=-d*d+f*(f+2*c)+l;else f<=-g?(d=Math.max(0,-(-a*r+o)),f=d>0?-r:Math.min(Math.max(-r,-c),r),p=-d*d+f*(f+2*c)+l):f<=g?(d=0,f=Math.min(Math.max(-r,-c),r),p=f*(f+2*c)+l):(d=Math.max(0,-(a*r+o)),f=d>0?r:Math.min(Math.max(-r,-c),r),p=-d*d+f*(f+2*c)+l);else f=a>0?-r:r,d=Math.max(0,-(a*f+o)),p=-d*d+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Za).addScaledVector(zs,f),p}intersectSphere(e,t){gn.subVectors(e.center,this.origin);let n=gn.dot(this.direction),s=gn.dot(gn)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c,l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,s=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,s=(e.min.x-f.x)*l),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-f.z)*d,c=(e.max.z-f.z)*d):(o=(e.max.z-f.z)*d,c=(e.min.z-f.z)*d),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,gn)!==null}intersectTriangle(e,t,n,s,r){Ja.subVectors(t,e),ks.subVectors(n,e),$a.crossVectors(Ja,ks);let a=this.direction.dot($a),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;In.subVectors(this.origin,e);let c=o*this.direction.dot(ks.crossVectors(In,ks));if(c<0)return null;let l=o*this.direction.dot(Ja.cross(In));if(l<0||c+l>a)return null;let h=-o*In.dot($a);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},it=class i{constructor(e,t,n,s,r,a,o,c,l,h,d,f,p,g,x,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,h,d,f,p,g,x,m)}set(e,t,n,s,r,a,o,c,l,h,d,f,p,g,x,m){let u=this.elements;return u[0]=e,u[4]=t,u[8]=n,u[12]=s,u[1]=r,u[5]=a,u[9]=o,u[13]=c,u[2]=l,u[6]=h,u[10]=d,u[14]=f,u[3]=p,u[7]=g,u[11]=x,u[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Mi.setFromMatrixColumn(e,0).length(),r=1/Mi.setFromMatrixColumn(e,1).length(),a=1/Mi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let f=a*h,p=a*d,g=o*h,x=o*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=p+g*l,t[5]=f-x*l,t[9]=-o*c,t[2]=x-f*l,t[6]=g+p*l,t[10]=a*c}else if(e.order==="YXZ"){let f=c*h,p=c*d,g=l*h,x=l*d;t[0]=f+x*o,t[4]=g*o-p,t[8]=a*l,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=x+f*o,t[10]=a*c}else if(e.order==="ZXY"){let f=c*h,p=c*d,g=l*h,x=l*d;t[0]=f-x*o,t[4]=-a*d,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=x-f*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let f=a*h,p=a*d,g=o*h,x=o*d;t[0]=c*h,t[4]=g*l-p,t[8]=f*l+x,t[1]=c*d,t[5]=x*l+f,t[9]=p*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let f=a*c,p=a*l,g=o*c,x=o*l;t[0]=c*h,t[4]=x-f*d,t[8]=g*d+p,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=p*d+g,t[10]=f-x*d}else if(e.order==="XZY"){let f=a*c,p=a*l,g=o*c,x=o*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=f*d+x,t[5]=a*h,t[9]=p*d-g,t[2]=g*d-p,t[6]=o*h,t[10]=x*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(bh,e,Eh)}lookAt(e,t,n){let s=this.elements;return Ut.subVectors(e,t),Ut.lengthSq()===0&&(Ut.z=1),Ut.normalize(),Pn.crossVectors(n,Ut),Pn.lengthSq()===0&&(Math.abs(n.z)===1?Ut.x+=1e-4:Ut.z+=1e-4,Ut.normalize(),Pn.crossVectors(n,Ut)),Pn.normalize(),Vs.crossVectors(Ut,Pn),s[0]=Pn.x,s[4]=Vs.x,s[8]=Ut.x,s[1]=Pn.y,s[5]=Vs.y,s[9]=Ut.y,s[2]=Pn.z,s[6]=Vs.z,s[10]=Ut.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],d=n[5],f=n[9],p=n[13],g=n[2],x=n[6],m=n[10],u=n[14],T=n[3],b=n[7],S=n[11],R=n[15],A=s[0],P=s[4],U=s[8],y=s[12],M=s[1],C=s[5],z=s[9],W=s[13],O=s[2],X=s[6],q=s[10],ie=s[14],Y=s[3],V=s[7],Z=s[11],K=s[15];return r[0]=a*A+o*M+c*O+l*Y,r[4]=a*P+o*C+c*X+l*V,r[8]=a*U+o*z+c*q+l*Z,r[12]=a*y+o*W+c*ie+l*K,r[1]=h*A+d*M+f*O+p*Y,r[5]=h*P+d*C+f*X+p*V,r[9]=h*U+d*z+f*q+p*Z,r[13]=h*y+d*W+f*ie+p*K,r[2]=g*A+x*M+m*O+u*Y,r[6]=g*P+x*C+m*X+u*V,r[10]=g*U+x*z+m*q+u*Z,r[14]=g*y+x*W+m*ie+u*K,r[3]=T*A+b*M+S*O+R*Y,r[7]=T*P+b*C+S*X+R*V,r[11]=T*U+b*z+S*q+R*Z,r[15]=T*y+b*W+S*ie+R*K,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],d=e[6],f=e[10],p=e[14],g=e[3],x=e[7],m=e[11],u=e[15];return g*(+r*c*d-s*l*d-r*o*f+n*l*f+s*o*p-n*c*p)+x*(+t*c*p-t*l*f+r*a*f-s*a*p+s*l*h-r*c*h)+m*(+t*l*d-t*o*p-r*a*d+n*a*p+r*o*h-n*l*h)+u*(-s*o*h-t*c*d+t*o*f+s*a*d-n*a*f+n*c*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=e[9],f=e[10],p=e[11],g=e[12],x=e[13],m=e[14],u=e[15],T=d*m*l-x*f*l+x*c*p-o*m*p-d*c*u+o*f*u,b=g*f*l-h*m*l-g*c*p+a*m*p+h*c*u-a*f*u,S=h*x*l-g*d*l+g*o*p-a*x*p-h*o*u+a*d*u,R=g*d*c-h*x*c-g*o*f+a*x*f+h*o*m-a*d*m,A=t*T+n*b+s*S+r*R;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let P=1/A;return e[0]=T*P,e[1]=(x*f*r-d*m*r-x*s*p+n*m*p+d*s*u-n*f*u)*P,e[2]=(o*m*r-x*c*r+x*s*l-n*m*l-o*s*u+n*c*u)*P,e[3]=(d*c*r-o*f*r-d*s*l+n*f*l+o*s*p-n*c*p)*P,e[4]=b*P,e[5]=(h*m*r-g*f*r+g*s*p-t*m*p-h*s*u+t*f*u)*P,e[6]=(g*c*r-a*m*r-g*s*l+t*m*l+a*s*u-t*c*u)*P,e[7]=(a*f*r-h*c*r+h*s*l-t*f*l-a*s*p+t*c*p)*P,e[8]=S*P,e[9]=(g*d*r-h*x*r-g*n*p+t*x*p+h*n*u-t*d*u)*P,e[10]=(a*x*r-g*o*r+g*n*l-t*x*l-a*n*u+t*o*u)*P,e[11]=(h*o*r-a*d*r-h*n*l+t*d*l+a*n*p-t*o*p)*P,e[12]=R*P,e[13]=(h*x*s-g*d*s+g*n*f-t*x*f-h*n*m+t*d*m)*P,e[14]=(g*o*s-a*x*s-g*n*c+t*x*c+a*n*m-t*o*m)*P,e[15]=(a*d*s-h*o*s+h*n*c-t*d*c-a*n*f+t*o*f)*P,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+n,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,d=o+o,f=r*l,p=r*h,g=r*d,x=a*h,m=a*d,u=o*d,T=c*l,b=c*h,S=c*d,R=n.x,A=n.y,P=n.z;return s[0]=(1-(x+u))*R,s[1]=(p+S)*R,s[2]=(g-b)*R,s[3]=0,s[4]=(p-S)*A,s[5]=(1-(f+u))*A,s[6]=(m+T)*A,s[7]=0,s[8]=(g+b)*P,s[9]=(m-T)*P,s[10]=(1-(f+x))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Mi.set(s[0],s[1],s[2]).length(),a=Mi.set(s[4],s[5],s[6]).length(),o=Mi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Kt.copy(this);let l=1/r,h=1/a,d=1/o;return Kt.elements[0]*=l,Kt.elements[1]*=l,Kt.elements[2]*=l,Kt.elements[4]*=h,Kt.elements[5]*=h,Kt.elements[6]*=h,Kt.elements[8]*=d,Kt.elements[9]*=d,Kt.elements[10]*=d,t.setFromRotationMatrix(Kt),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=jt,c=!1){let l=this.elements,h=2*r/(t-e),d=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s),g,x;if(c)g=r/(a-r),x=a*r/(a-r);else if(o===jt)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===ts)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=jt,c=!1){let l=this.elements,h=2/(t-e),d=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s),g,x;if(c)g=1/(a-r),x=a/(a-r);else if(o===jt)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===ts)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Mi=new I,Kt=new it,bh=new I(0,0,0),Eh=new I(1,1,1),Pn=new I,Vs=new I,Ut=new I,Sl=new it,bl=new tn,nn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],d=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Ge(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ge(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ge(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ge(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Ge(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ge(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Sl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Sl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return bl.setFromEuler(this),this.setFromQuaternion(bl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};nn.DEFAULT_ORDER="XYZ";var rs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Th=0,El=new I,Si=new tn,_n=new it,Hs=new I,Zi=new I,wh=new I,Ah=new tn,Tl=new I(1,0,0),wl=new I(0,1,0),Al=new I(0,0,1),Rl={type:"added"},Rh={type:"removed"},bi={type:"childadded",child:null},Ka={type:"childremoved",child:null},vt=class i extends Sn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Th++}),this.uuid=As(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new I,t=new nn,n=new tn,s=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new it},normalMatrix:{value:new ze}}),this.matrix=new it,this.matrixWorld=new it,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Si.setFromAxisAngle(e,t),this.quaternion.multiply(Si),this}rotateOnWorldAxis(e,t){return Si.setFromAxisAngle(e,t),this.quaternion.premultiply(Si),this}rotateX(e){return this.rotateOnAxis(Tl,e)}rotateY(e){return this.rotateOnAxis(wl,e)}rotateZ(e){return this.rotateOnAxis(Al,e)}translateOnAxis(e,t){return El.copy(e).applyQuaternion(this.quaternion),this.position.add(El.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Tl,e)}translateY(e){return this.translateOnAxis(wl,e)}translateZ(e){return this.translateOnAxis(Al,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(_n.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Hs.copy(e):Hs.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Zi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?_n.lookAt(Zi,Hs,this.up):_n.lookAt(Hs,Zi,this.up),this.quaternion.setFromRotationMatrix(_n),s&&(_n.extractRotation(s.matrixWorld),Si.setFromRotationMatrix(_n),this.quaternion.premultiply(Si.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Rl),bi.child=e,this.dispatchEvent(bi),bi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Rh),Ka.child=e,this.dispatchEvent(Ka),Ka.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),_n.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),_n.multiply(e.parent.matrixWorld)),e.applyMatrix4(_n),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Rl),bi.child=e,this.dispatchEvent(bi),bi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zi,e,wh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zi,Ah,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let d=c[l];r(e.shapes,d)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),d=a(e.shapes),f=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};vt.DEFAULT_UP=new I(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qt=new I,xn=new I,Qa=new I,vn=new I,Ei=new I,Ti=new I,Cl=new I,ja=new I,eo=new I,to=new I,no=new lt,io=new lt,so=new lt,Un=class i{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Qt.subVectors(e,t),s.cross(Qt);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Qt.subVectors(s,t),xn.subVectors(n,t),Qa.subVectors(e,t);let a=Qt.dot(Qt),o=Qt.dot(xn),c=Qt.dot(Qa),l=xn.dot(xn),h=xn.dot(Qa),d=a*l-o*o;if(d===0)return r.set(0,0,0),null;let f=1/d,p=(l*c-o*h)*f,g=(a*h-o*c)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,vn)===null?!1:vn.x>=0&&vn.y>=0&&vn.x+vn.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,vn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,vn.x),c.addScaledVector(a,vn.y),c.addScaledVector(o,vn.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return no.setScalar(0),io.setScalar(0),so.setScalar(0),no.fromBufferAttribute(e,t),io.fromBufferAttribute(e,n),so.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(no,r.x),a.addScaledVector(io,r.y),a.addScaledVector(so,r.z),a}static isFrontFacing(e,t,n,s){return Qt.subVectors(n,t),xn.subVectors(e,t),Qt.cross(xn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qt.subVectors(this.c,this.b),xn.subVectors(this.a,this.b),Qt.cross(xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Ei.subVectors(s,n),Ti.subVectors(r,n),ja.subVectors(e,n);let c=Ei.dot(ja),l=Ti.dot(ja);if(c<=0&&l<=0)return t.copy(n);eo.subVectors(e,s);let h=Ei.dot(eo),d=Ti.dot(eo);if(h>=0&&d<=h)return t.copy(s);let f=c*d-h*l;if(f<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(n).addScaledVector(Ei,a);to.subVectors(e,r);let p=Ei.dot(to),g=Ti.dot(to);if(g>=0&&p<=g)return t.copy(r);let x=p*l-c*g;if(x<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(n).addScaledVector(Ti,o);let m=h*g-p*d;if(m<=0&&d-h>=0&&p-g>=0)return Cl.subVectors(r,s),o=(d-h)/(d-h+(p-g)),t.copy(s).addScaledVector(Cl,o);let u=1/(m+x+f);return a=x*u,o=f*u,t.copy(n).addScaledVector(Ei,a).addScaledVector(Ti,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Lc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ln={h:0,s:0,l:0},Gs={h:0,s:0,l:0};function ro(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ve=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ft){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=xh(e,1),t=Ge(t,0,1),n=Ge(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ro(a,r,e+1/3),this.g=ro(a,r,e),this.b=ro(a,r,e-1/3)}return Ye.colorSpaceToWorking(this,s),this}setStyle(e,t=Ft){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ft){let n=Lc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yn(e.r),this.g=yn(e.g),this.b=yn(e.b),this}copyLinearToSRGB(e){return this.r=Ci(e.r),this.g=Ci(e.g),this.b=Ci(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ft){return Ye.workingToColorSpace(Mt.copy(this),e),Math.round(Ge(Mt.r*255,0,255))*65536+Math.round(Ge(Mt.g*255,0,255))*256+Math.round(Ge(Mt.b*255,0,255))}getHexString(e=Ft){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.workingToColorSpace(Mt.copy(this),t);let n=Mt.r,s=Mt.g,r=Mt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let d=a-o;switch(l=h<=.5?d/(a+o):d/(2-a-o),a){case n:c=(s-r)/d+(s<r?6:0);break;case s:c=(r-n)/d+2;break;case r:c=(n-s)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Ye.workingColorSpace){return Ye.workingToColorSpace(Mt.copy(this),t),e.r=Mt.r,e.g=Mt.g,e.b=Mt.b,e}getStyle(e=Ft){Ye.workingToColorSpace(Mt.copy(this),e);let t=Mt.r,n=Mt.g,s=Mt.b;return e!==Ft?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ln),this.setHSL(Ln.h+e,Ln.s+t,Ln.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ln),e.getHSL(Gs);let n=Va(Ln.h,Gs.h,t),s=Va(Ln.s,Gs.s,t),r=Va(Ln.l,Gs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Mt=new Ve;Ve.NAMES=Lc;var Ch=0,bn=class extends Sn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ch++}),this.uuid=As(),this.name="",this.type="Material",this.blending=ei,this.side=Mn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rr,this.blendDst=ar,this.blendEquation=Fn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=ti,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=vo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=jn,this.stencilZFail=jn,this.stencilZPass=jn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ei&&(n.blending=this.blending),this.side!==Mn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==rr&&(n.blendSrc=this.blendSrc),this.blendDst!==ar&&(n.blendDst=this.blendDst),this.blendEquation!==Fn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ti&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==vo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==jn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==jn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==jn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Bn=class extends bn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=qr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var ft=new I,Ws=new Le,Ih=0,xt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ih++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=yo,this.updateRanges=[],this.gpuType=dn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ws.fromBufferAttribute(this,t),Ws.applyMatrix3(e),this.setXY(t,Ws.x,Ws.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix3(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyMatrix4(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.applyNormalMatrix(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ft.fromBufferAttribute(this,t),ft.transformDirection(e),this.setXYZ(t,ft.x,ft.y,ft.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Xi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ct(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Xi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ct(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Xi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ct(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Xi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ct(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Xi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ct(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ct(t,this.array),n=Ct(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ct(t,this.array),n=Ct(n,this.array),s=Ct(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ct(t,this.array),n=Ct(n,this.array),s=Ct(s,this.array),r=Ct(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==yo&&(e.usage=this.usage),e}};var as=class extends xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var os=class extends xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var st=class extends xt{constructor(e,t,n){super(new Float32Array(e),t,n)}},Ph=0,Ht=new it,ao=new vt,wi=new I,Nt=new On,Ji=new On,_t=new I,pt=class i extends Sn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ph++}),this.uuid=As(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Vo(e)?os:as)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Ht.makeRotationFromQuaternion(e),this.applyMatrix4(Ht),this}rotateX(e){return Ht.makeRotationX(e),this.applyMatrix4(Ht),this}rotateY(e){return Ht.makeRotationY(e),this.applyMatrix4(Ht),this}rotateZ(e){return Ht.makeRotationZ(e),this.applyMatrix4(Ht),this}translate(e,t,n){return Ht.makeTranslation(e,t,n),this.applyMatrix4(Ht),this}scale(e,t,n){return Ht.makeScale(e,t,n),this.applyMatrix4(Ht),this}lookAt(e){return ao.lookAt(e),ao.updateMatrix(),this.applyMatrix4(ao.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new st(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new On);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Nt.setFromBufferAttribute(r),this.morphTargetsRelative?(_t.addVectors(this.boundingBox.min,Nt.min),this.boundingBox.expandByPoint(_t),_t.addVectors(this.boundingBox.max,Nt.max),this.boundingBox.expandByPoint(_t)):(this.boundingBox.expandByPoint(Nt.min),this.boundingBox.expandByPoint(Nt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ii);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){let n=this.boundingSphere.center;if(Nt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Ji.setFromBufferAttribute(o),this.morphTargetsRelative?(_t.addVectors(Nt.min,Ji.min),Nt.expandByPoint(_t),_t.addVectors(Nt.max,Ji.max),Nt.expandByPoint(_t)):(Nt.expandByPoint(Ji.min),Nt.expandByPoint(Ji.max))}Nt.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)_t.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(_t));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)_t.fromBufferAttribute(o,l),c&&(wi.fromBufferAttribute(e,l),_t.add(wi)),s=Math.max(s,n.distanceToSquared(_t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xt(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],c=[];for(let U=0;U<n.count;U++)o[U]=new I,c[U]=new I;let l=new I,h=new I,d=new I,f=new Le,p=new Le,g=new Le,x=new I,m=new I;function u(U,y,M){l.fromBufferAttribute(n,U),h.fromBufferAttribute(n,y),d.fromBufferAttribute(n,M),f.fromBufferAttribute(r,U),p.fromBufferAttribute(r,y),g.fromBufferAttribute(r,M),h.sub(l),d.sub(l),p.sub(f),g.sub(f);let C=1/(p.x*g.y-g.x*p.y);isFinite(C)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(C),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(C),o[U].add(x),o[y].add(x),o[M].add(x),c[U].add(m),c[y].add(m),c[M].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let U=0,y=T.length;U<y;++U){let M=T[U],C=M.start,z=M.count;for(let W=C,O=C+z;W<O;W+=3)u(e.getX(W+0),e.getX(W+1),e.getX(W+2))}let b=new I,S=new I,R=new I,A=new I;function P(U){R.fromBufferAttribute(s,U),A.copy(R);let y=o[U];b.copy(y),b.sub(R.multiplyScalar(R.dot(y))).normalize(),S.crossVectors(A,y);let C=S.dot(c[U])<0?-1:1;a.setXYZW(U,b.x,b.y,b.z,C)}for(let U=0,y=T.length;U<y;++U){let M=T[U],C=M.start,z=M.count;for(let W=C,O=C+z;W<O;W+=3)P(e.getX(W+0)),P(e.getX(W+1)),P(e.getX(W+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new I,r=new I,a=new I,o=new I,c=new I,l=new I,h=new I,d=new I;if(e)for(let f=0,p=e.count;f<p;f+=3){let g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(n,g),c.fromBufferAttribute(n,x),l.fromBufferAttribute(n,m),o.add(h),c.add(h),l.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)_t.fromBufferAttribute(e,t),_t.normalize(),e.setXYZ(t,_t.x,_t.y,_t.z)}toNonIndexed(){function e(o,c){let l=o.array,h=o.itemSize,d=o.normalized,f=new l.constructor(c.length*h),p=0,g=0;for(let x=0,m=c.length;x<m;x++){o.isInterleavedBufferAttribute?p=c[x]*o.data.stride+o.offset:p=c[x]*h;for(let u=0;u<h;u++)f[g++]=l[p++]}return new xt(f,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,n);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let h=0,d=l.length;h<d;h++){let f=l[h],p=e(f,n);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let d=0,f=l.length;d<f;d++){let p=l[d];h.push(p.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(t))}let r=e.morphAttributes;for(let l in r){let h=[],d=r[l];for(let f=0,p=d.length;f<p;f++)h.push(d[f].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,h=a.length;l<h;l++){let d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Il=new it,Kn=new ss,Xs=new ii,Pl=new I,qs=new I,Ys=new I,Zs=new I,oo=new I,Js=new I,Ll=new I,$s=new I,Tt=class extends vt{constructor(e=new pt,t=new Bn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Js.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=o[c],d=r[c];h!==0&&(oo.fromBufferAttribute(d,e),a?Js.addScaledVector(oo,h):Js.addScaledVector(oo.sub(t),h))}t.add(Js)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Xs.copy(n.boundingSphere),Xs.applyMatrix4(r),Kn.copy(e.ray).recast(e.near),!(Xs.containsPoint(Kn.origin)===!1&&(Kn.intersectSphere(Xs,Pl)===null||Kn.origin.distanceToSquared(Pl)>(e.far-e.near)**2))&&(Il.copy(r).invert(),Kn.copy(e.ray).applyMatrix4(Il),!(n.boundingBox!==null&&Kn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Kn)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){let m=f[g],u=a[m.materialIndex],T=Math.max(m.start,p.start),b=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let S=T,R=b;S<R;S+=3){let A=o.getX(S),P=o.getX(S+1),U=o.getX(S+2);s=Ks(this,u,e,n,l,h,d,A,P,U),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(o.count,p.start+p.count);for(let m=g,u=x;m<u;m+=3){let T=o.getX(m),b=o.getX(m+1),S=o.getX(m+2);s=Ks(this,a,e,n,l,h,d,T,b,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){let m=f[g],u=a[m.materialIndex],T=Math.max(m.start,p.start),b=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let S=T,R=b;S<R;S+=3){let A=S,P=S+1,U=S+2;s=Ks(this,u,e,n,l,h,d,A,P,U),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let m=g,u=x;m<u;m+=3){let T=m,b=m+1,S=m+2;s=Ks(this,a,e,n,l,h,d,T,b,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Lh(i,e,t,n,s,r,a,o){let c;if(e.side===wt?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===Mn,o),c===null)return null;$s.copy(o),$s.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo($s);return l<t.near||l>t.far?null:{distance:l,point:$s.clone(),object:i}}function Ks(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,qs),i.getVertexPosition(c,Ys),i.getVertexPosition(l,Zs);let h=Lh(i,e,t,n,qs,Ys,Zs,Ll);if(h){let d=new I;Un.getBarycoord(Ll,qs,Ys,Zs,d),s&&(h.uv=Un.getInterpolatedAttribute(s,o,c,l,d,new Le)),r&&(h.uv1=Un.getInterpolatedAttribute(r,o,c,l,d,new Le)),a&&(h.normal=Un.getInterpolatedAttribute(a,o,c,l,d,new I),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let f={a:o,b:c,c:l,normal:new I,materialIndex:0};Un.getNormal(qs,Ys,Zs,f.normal),h.face=f,h.barycoord=d}return h}var zn=class i extends pt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],h=[],d=[],f=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new st(l,3)),this.setAttribute("normal",new st(h,3)),this.setAttribute("uv",new st(d,2));function g(x,m,u,T,b,S,R,A,P,U,y){let M=S/P,C=R/U,z=S/2,W=R/2,O=A/2,X=P+1,q=U+1,ie=0,Y=0,V=new I;for(let Z=0;Z<q;Z++){let K=Z*C-W;for(let me=0;me<X;me++){let Se=me*M-z;V[x]=Se*T,V[m]=K*b,V[u]=O,l.push(V.x,V.y,V.z),V[x]=0,V[m]=0,V[u]=A>0?1:-1,h.push(V.x,V.y,V.z),d.push(me/P),d.push(1-Z/U),ie+=1}}for(let Z=0;Z<U;Z++)for(let K=0;K<P;K++){let me=f+K+X*Z,Se=f+K+X*(Z+1),be=f+(K+1)+X*(Z+1),_e=f+(K+1)+X*Z;c.push(me,Se,_e),c.push(Se,be,_e),Y+=6}o.addGroup(p,Y,y),p+=Y,f+=ie}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function ui(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function St(i){let e={};for(let t=0;t<i.length;t++){let n=ui(i[t]);for(let s in n)e[s]=n[s]}return e}function Dh(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ho(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ye.workingColorSpace}var Dc={clone:ui,merge:St},Uh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Nh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,sn=class extends bn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Uh,this.fragmentShader=Nh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ui(e.uniforms),this.uniformsGroups=Dh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ls=class extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new it,this.projectionMatrix=new it,this.projectionMatrixInverse=new it,this.coordinateSystem=jt,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Dn=new I,Dl=new Le,Ul=new Le,It=class extends ls{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=hr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ka*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return hr*2*Math.atan(Math.tan(ka*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Dn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Dn.x,Dn.y).multiplyScalar(-e/Dn.z),Dn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Dn.x,Dn.y).multiplyScalar(-e/Dn.z)}getViewSize(e,t){return this.getViewBounds(e,Dl,Ul),t.subVectors(Ul,Dl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ka*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ai=-90,Ri=1,pr=class extends vt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new It(Ai,Ri,e,t);s.layers=this.layers,this.add(s);let r=new It(Ai,Ri,e,t);r.layers=this.layers,this.add(r);let a=new It(Ai,Ri,e,t);a.layers=this.layers,this.add(a);let o=new It(Ai,Ri,e,t);o.layers=this.layers,this.add(o);let c=new It(Ai,Ri,e,t);c.layers=this.layers,this.add(c);let l=new It(Ai,Ri,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===jt)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ts)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,h]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,l),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(d,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},cs=class extends Ot{constructor(e=[],t=ci,n,s,r,a,o,c,l,h){super(e,t,n,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},mr=class extends cn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new cs(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new zn(5,5,5),r=new sn({name:"CubemapFromEquirect",uniforms:ui(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:wt,blending:En});r.uniforms.tEquirect.value=t;let a=new Tt(s,r),o=t.minFilter;return t.minFilter===Wn&&(t.minFilter=en),new pr(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}},Et=class extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Fh={type:"move"},Di=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Et,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Et,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Et,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,n),u=this._getHandJoint(l,x);m!==null&&(u.matrix.fromArray(m.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=m.radius),u.visible=m!==null}let h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],f=h.position.distanceTo(d.position),p=.02,g=.005;l.inputState.pinching&&f>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Fh)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Et;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var hs=class extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nn,this.environmentIntensity=1,this.environmentRotation=new nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var lo=new I,Oh=new I,Bh=new ze,ln=class{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=lo.subVectors(n,t).cross(Oh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(lo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Bh.getNormalMatrix(e),s=this.coplanarPoint(lo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Qn=new ii,zh=new Le(.5,.5),Qs=new I,Ui=class{constructor(e=new ln,t=new ln,n=new ln,s=new ln,r=new ln,a=new ln){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=jt,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],d=r[5],f=r[6],p=r[7],g=r[8],x=r[9],m=r[10],u=r[11],T=r[12],b=r[13],S=r[14],R=r[15];if(s[0].setComponents(l-a,p-h,u-g,R-T).normalize(),s[1].setComponents(l+a,p+h,u+g,R+T).normalize(),s[2].setComponents(l+o,p+d,u+x,R+b).normalize(),s[3].setComponents(l-o,p-d,u-x,R-b).normalize(),n)s[4].setComponents(c,f,m,S).normalize(),s[5].setComponents(l-c,p-f,u-m,R-S).normalize();else if(s[4].setComponents(l-c,p-f,u-m,R-S).normalize(),t===jt)s[5].setComponents(l+c,p+f,u+m,R+S).normalize();else if(t===ts)s[5].setComponents(c,f,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Qn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Qn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Qn)}intersectsSprite(e){Qn.center.set(0,0,0);let t=zh.distanceTo(e.center);return Qn.radius=.7071067811865476+t,Qn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Qn)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Qs.x=s.normal.x>0?e.max.x:e.min.x,Qs.y=s.normal.y>0?e.max.y:e.min.y,Qs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Qs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var kn=class extends bn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},gr=new I,_r=new I,Nl=new it,$i=new ss,js=new ii,co=new I,Fl=new I,si=class extends vt{constructor(e=new pt,t=new kn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)gr.fromBufferAttribute(t,s-1),_r.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=gr.distanceTo(_r);e.setAttribute("lineDistance",new st(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),js.copy(n.boundingSphere),js.applyMatrix4(s),js.radius+=r,e.ray.intersectsSphere(js)===!1)return;Nl.copy(s).invert(),$i.copy(e.ray).applyMatrix4(Nl);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){let p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let x=p,m=g-1;x<m;x+=l){let u=h.getX(x),T=h.getX(x+1),b=er(this,e,$i,c,u,T,x);b&&t.push(b)}if(this.isLineLoop){let x=h.getX(g-1),m=h.getX(p),u=er(this,e,$i,c,x,m,g-1);u&&t.push(u)}}else{let p=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let x=p,m=g-1;x<m;x+=l){let u=er(this,e,$i,c,x,x+1,x);u&&t.push(u)}if(this.isLineLoop){let x=er(this,e,$i,c,g-1,p,g-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function er(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(gr.fromBufferAttribute(o,s),_r.fromBufferAttribute(o,r),t.distanceSqToSegment(gr,_r,co,Fl)>n)return;co.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(co);if(!(l<e.near||l>e.far))return{distance:l,point:Fl.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Ol=new I,Bl=new I,xr=class extends si{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Ol.fromBufferAttribute(t,s),Bl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ol.distanceTo(Bl);e.setAttribute("lineDistance",new st(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var us=class extends Ot{constructor(e,t,n=Xn,s,r,a,o=Gt,c=Gt,l,h=Ii,d=1){if(h!==Ii&&h!==zi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:d};super(f,s,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Li(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ds=class extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Wt=class i extends pt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],f=[],p=[],g=0,x=[],m=n/2,u=0;T(),a===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new st(d,3)),this.setAttribute("normal",new st(f,3)),this.setAttribute("uv",new st(p,2));function T(){let S=new I,R=new I,A=0,P=(t-e)/n;for(let U=0;U<=r;U++){let y=[],M=U/r,C=M*(t-e)+e;for(let z=0;z<=s;z++){let W=z/s,O=W*c+o,X=Math.sin(O),q=Math.cos(O);R.x=C*X,R.y=-M*n+m,R.z=C*q,d.push(R.x,R.y,R.z),S.set(X,P,q).normalize(),f.push(S.x,S.y,S.z),p.push(W,1-M),y.push(g++)}x.push(y)}for(let U=0;U<s;U++)for(let y=0;y<r;y++){let M=x[y][U],C=x[y+1][U],z=x[y+1][U+1],W=x[y][U+1];(e>0||y!==0)&&(h.push(M,C,W),A+=3),(t>0||y!==r-1)&&(h.push(C,z,W),A+=3)}l.addGroup(u,A,0),u+=A}function b(S){let R=g,A=new Le,P=new I,U=0,y=S===!0?e:t,M=S===!0?1:-1;for(let z=1;z<=s;z++)d.push(0,m*M,0),f.push(0,M,0),p.push(.5,.5),g++;let C=g;for(let z=0;z<=s;z++){let O=z/s*c+o,X=Math.cos(O),q=Math.sin(O);P.x=y*q,P.y=m*M,P.z=y*X,d.push(P.x,P.y,P.z),f.push(0,M,0),A.x=X*.5+.5,A.y=q*.5*M+.5,p.push(A.x,A.y),g++}for(let z=0;z<s;z++){let W=R+z,O=C+z;S===!0?h.push(O,O+1,W):h.push(O+1,O,W),U+=3}l.addGroup(u,U,S===!0?1:2),u+=U}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},vr=class i extends Wt{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Xt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let h=n[s],f=n[s+1]-h,p=(a-h)/f;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new Le:new I);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new I,s=[],r=[],a=[],o=new I,c=new it;for(let p=0;p<=e;p++){let g=p/e;s[p]=this.getTangentAt(g,new I)}r[0]=new I,a[0]=new I;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),d<=l&&(l=d,n.set(0,1,0)),f<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Ge(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(c.makeRotationAxis(o,g))}a[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(Ge(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(p=-p);for(let g=1;g<=e;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],p*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},fs=class extends Xt{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Le){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=c-this.aX,p=l-this.aY;c=f*h-p*d+this.aX,l=f*d+p*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},yr=class extends fs{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Go(){let i=0,e=0,t=0,n=0;function s(r,a,o,c){i=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,h,d){let f=(a-r)/l-(o-r)/(l+h)+(o-a)/h,p=(o-a)/h-(c-a)/(h+d)+(c-o)/d;f*=h,p*=h,s(a,o,f,p)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var tr=new I,ho=new Go,uo=new Go,fo=new Go,Vn=class extends Xt{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new I){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,h;this.closed||o>0?l=s[(o-1)%r]:(tr.subVectors(s[0],s[1]).add(s[0]),l=tr);let d=s[o%r],f=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(tr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=tr),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(d),p),x=Math.pow(d.distanceToSquared(f),p),m=Math.pow(f.distanceToSquared(h),p);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),ho.initNonuniformCatmullRom(l.x,d.x,f.x,h.x,g,x,m),uo.initNonuniformCatmullRom(l.y,d.y,f.y,h.y,g,x,m),fo.initNonuniformCatmullRom(l.z,d.z,f.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(ho.initCatmullRom(l.x,d.x,f.x,h.x,this.tension),uo.initCatmullRom(l.y,d.y,f.y,h.y,this.tension),fo.initCatmullRom(l.z,d.z,f.z,h.z,this.tension));return n.set(ho.calc(c),uo.calc(c),fo.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new I().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function zl(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,c=i*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*i+t}function kh(i,e){let t=1-i;return t*t*e}function Vh(i,e){return 2*(1-i)*i*e}function Hh(i,e){return i*i*e}function Ki(i,e,t,n){return kh(i,e)+Vh(i,t)+Hh(i,n)}function Gh(i,e){let t=1-i;return t*t*t*e}function Wh(i,e){let t=1-i;return 3*t*t*i*e}function Xh(i,e){return 3*(1-i)*i*i*e}function qh(i,e){return i*i*i*e}function Qi(i,e,t,n,s){return Gh(i,e)+Wh(i,t)+Xh(i,n)+qh(i,s)}var Mr=class extends Xt{constructor(e=new Le,t=new Le,n=new Le,s=new Le){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Le){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qi(e,s.x,r.x,a.x,o.x),Qi(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Sr=class extends Xt{constructor(e=new I,t=new I,n=new I,s=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new I){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qi(e,s.x,r.x,a.x,o.x),Qi(e,s.y,r.y,a.y,o.y),Qi(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},br=class extends Xt{constructor(e=new Le,t=new Le){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Le){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Le){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Er=class extends Xt{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Tr=class extends Xt{constructor(e=new Le,t=new Le,n=new Le){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Le){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Ki(e,s.x,r.x,a.x),Ki(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ps=class extends Xt{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Ki(e,s.x,r.x,a.x),Ki(e,s.y,r.y,a.y),Ki(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wr=class extends Xt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Le){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set(zl(o,c.x,l.x,h.x,d.x),zl(o,c.y,l.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new Le().fromArray(s))}return this}},Yh=Object.freeze({__proto__:null,ArcCurve:yr,CatmullRomCurve3:Vn,CubicBezierCurve:Mr,CubicBezierCurve3:Sr,EllipseCurve:fs,LineCurve:br,LineCurve3:Er,QuadraticBezierCurve:Tr,QuadraticBezierCurve3:ps,SplineCurve:wr});var ri=class i extends pt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,h=c+1,d=e/o,f=t/c,p=[],g=[],x=[],m=[];for(let u=0;u<h;u++){let T=u*f-a;for(let b=0;b<l;b++){let S=b*d-r;g.push(S,-T,0),x.push(0,0,1),m.push(b/o),m.push(1-u/c)}}for(let u=0;u<c;u++)for(let T=0;T<o;T++){let b=T+l*u,S=T+l*(u+1),R=T+1+l*(u+1),A=T+1+l*u;p.push(b,S,A),p.push(S,R,A)}this.setIndex(p),this.setAttribute("position",new st(g,3)),this.setAttribute("normal",new st(x,3)),this.setAttribute("uv",new st(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var hn=class i extends pt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,h=[],d=new I,f=new I,p=[],g=[],x=[],m=[];for(let u=0;u<=n;u++){let T=[],b=u/n,S=0;u===0&&a===0?S=.5/t:u===n&&c===Math.PI&&(S=-.5/t);for(let R=0;R<=t;R++){let A=R/t;d.x=-e*Math.cos(s+A*r)*Math.sin(a+b*o),d.y=e*Math.cos(a+b*o),d.z=e*Math.sin(s+A*r)*Math.sin(a+b*o),g.push(d.x,d.y,d.z),f.copy(d).normalize(),x.push(f.x,f.y,f.z),m.push(A+S,1-b),T.push(l++)}h.push(T)}for(let u=0;u<n;u++)for(let T=0;T<t;T++){let b=h[u][T+1],S=h[u][T],R=h[u+1][T],A=h[u+1][T+1];(u!==0||a>0)&&p.push(b,S,A),(u!==n-1||c<Math.PI)&&p.push(S,R,A)}this.setIndex(p),this.setAttribute("position",new st(g,3)),this.setAttribute("normal",new st(x,3)),this.setAttribute("uv",new st(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ai=class i extends pt{constructor(e=new ps(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new I,c=new I,l=new Le,h=new I,d=[],f=[],p=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new st(d,3)),this.setAttribute("normal",new st(f,3)),this.setAttribute("uv",new st(p,2));function x(){for(let b=0;b<t;b++)m(b);m(r===!1?t:0),T(),u()}function m(b){h=e.getPointAt(b/t,h);let S=a.normals[b],R=a.binormals[b];for(let A=0;A<=s;A++){let P=A/s*Math.PI*2,U=Math.sin(P),y=-Math.cos(P);c.x=y*S.x+U*R.x,c.y=y*S.y+U*R.y,c.z=y*S.z+U*R.z,c.normalize(),f.push(c.x,c.y,c.z),o.x=h.x+n*c.x,o.y=h.y+n*c.y,o.z=h.z+n*c.z,d.push(o.x,o.y,o.z)}}function u(){for(let b=1;b<=t;b++)for(let S=1;S<=s;S++){let R=(s+1)*(b-1)+(S-1),A=(s+1)*b+(S-1),P=(s+1)*b+S,U=(s+1)*(b-1)+S;g.push(R,A,U),g.push(A,P,U)}}function T(){for(let b=0;b<=t;b++)for(let S=0;S<=s;S++)l.x=b/t,l.y=S/s,p.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Yh[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var ms=class extends bn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ve(16777215),this.specular=new Ve(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Bo,this.normalScale=new Le(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=qr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ar=class extends bn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=yc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Rr=class extends bn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function nr(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Zh(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var oi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Cr=class extends oi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:go,endingEnd:go}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case _o:r=e,o=2*t-n;break;case xo:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case _o:a=e,c=2*n-t;break;case xo:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}let l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,d=this._offsetNext,f=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,u=-f*m+2*f*x-f*g,T=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*g+1,b=(-1-p)*m+(1.5+p)*x+.5*g,S=p*m-p*x;for(let R=0;R!==o;++R)r[R]=u*a[h+R]+T*a[l+R]+b*a[c+R]+S*a[d+R];return r}},Ir=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(s-t),d=1-h;for(let f=0;f!==o;++f)r[f]=a[l+f]*d+a[c+f]*h;return r}},Pr=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Bt=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=nr(t,this.TimeBufferType),this.values=nr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:nr(e.times,Array),values:nr(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Pr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ir(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Cr(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ji:t=this.InterpolantFactoryMethodDiscrete;break;case cr:t=this.InterpolantFactoryMethodLinear;break;case sr:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ji;case this.InterpolantFactoryMethodLinear:return cr;case this.InterpolantFactoryMethodSmooth:return sr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Zh(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===sr,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(s)c=!0;else{let d=o*n,f=d-n,p=d+n;for(let g=0;g!==n;++g){let x=t[d+g];if(x!==t[f+g]||x!==t[p+g]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let d=o*n,f=a*n;for(let p=0;p!==n;++p)t[f+p]=t[d+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Bt.prototype.ValueTypeName="";Bt.prototype.TimeBufferType=Float32Array;Bt.prototype.ValueBufferType=Float32Array;Bt.prototype.DefaultInterpolation=cr;var Hn=class extends Bt{constructor(e,t,n){super(e,t,n)}};Hn.prototype.ValueTypeName="bool";Hn.prototype.ValueBufferType=Array;Hn.prototype.DefaultInterpolation=ji;Hn.prototype.InterpolantFactoryMethodLinear=void 0;Hn.prototype.InterpolantFactoryMethodSmooth=void 0;var Lr=class extends Bt{constructor(e,t,n,s){super(e,t,n,s)}};Lr.prototype.ValueTypeName="color";var Dr=class extends Bt{constructor(e,t,n,s){super(e,t,n,s)}};Dr.prototype.ValueTypeName="number";var Ur=class extends oi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t),l=e*o;for(let h=l+o;l!==h;l+=4)tn.slerpFlat(r,0,a,l-o,a,l,c);return r}},gs=class extends Bt{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ur(this.times,this.values,this.getValueSize(),e)}};gs.prototype.ValueTypeName="quaternion";gs.prototype.InterpolantFactoryMethodSmooth=void 0;var Gn=class extends Bt{constructor(e,t,n){super(e,t,n)}};Gn.prototype.ValueTypeName="string";Gn.prototype.ValueBufferType=Array;Gn.prototype.DefaultInterpolation=ji;Gn.prototype.InterpolantFactoryMethodLinear=void 0;Gn.prototype.InterpolantFactoryMethodSmooth=void 0;var Nr=class extends Bt{constructor(e,t,n,s){super(e,t,n,s)}};Nr.prototype.ValueTypeName="vector";var Fr=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){let d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,f=l.length;d<f;d+=2){let p=l[d],g=l[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Uc=new Fr,Or=class{constructor(e){this.manager=e!==void 0?e:Uc,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Or.DEFAULT_MATERIAL_NAME="__DEFAULT";var _s=class extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}};var po=new it,kl=new I,Vl=new I,Mo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Le(512,512),this.mapType=rn,this.map=null,this.mapPass=null,this.matrix=new it,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ui,this._frameExtents=new Le(1,1),this._viewportCount=1,this._viewports=[new lt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;kl.setFromMatrixPosition(e.matrixWorld),t.position.copy(kl),Vl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Vl),t.updateMatrixWorld(),po.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(po,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(po)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var li=class extends ls{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},So=class extends Mo{constructor(){super(new li(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ni=class extends _s{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new So}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},xs=class extends _s{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}};var Br=class extends It{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Wo="\\[\\]\\.:\\/",Jh=new RegExp("["+Wo+"]","g"),Xo="[^"+Wo+"]",$h="[^"+Wo.replace("\\.","")+"]",Kh=/((?:WC+[\/:])*)/.source.replace("WC",Xo),Qh=/(WCOD+)?/.source.replace("WCOD",$h),jh=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Xo),eu=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Xo),tu=new RegExp("^"+Kh+Qh+jh+eu+"$"),nu=["material","materials","bones","map"],bo=class{constructor(e,t,n){let s=n||nt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},nt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Jh,"")}static parseTrackName(e){let t=tu.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);nu.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};nt.Composite=bo;nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};nt.prototype.GetterByBindingType=[nt.prototype._getValue_direct,nt.prototype._getValue_array,nt.prototype._getValue_arrayElement,nt.prototype._getValue_toArray];nt.prototype.SetterByBindingTypeAndVersioning=[[nt.prototype._setValue_direct,nt.prototype._setValue_direct_setNeedsUpdate,nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_array,nt.prototype._setValue_array_setNeedsUpdate,nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_arrayElement,nt.prototype._setValue_arrayElement_setNeedsUpdate,nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_fromArray,nt.prototype._setValue_fromArray_setNeedsUpdate,nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bm=new Float32Array(1);var vs=class extends xr{constructor(e=10,t=10,n=4473924,s=8947848){n=new Ve(n),s=new Ve(s);let r=t/2,a=e/t,o=e/2,c=[],l=[];for(let f=0,p=0,g=-o;f<=t;f++,g+=a){c.push(-o,0,g,o,0,g),c.push(g,0,-o,g,0,o);let x=f===r?n:s;x.toArray(l,p),p+=3,x.toArray(l,p),p+=3,x.toArray(l,p),p+=3,x.toArray(l,p),p+=3}let h=new pt;h.setAttribute("position",new st(c,3)),h.setAttribute("color",new st(l,3));let d=new kn({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}};var Hl=new I,ir,mo,ys=class extends vt{constructor(e=new I(0,0,1),t=new I(0,0,0),n=1,s=16776960,r=n*.2,a=r*.2){super(),this.type="ArrowHelper",ir===void 0&&(ir=new pt,ir.setAttribute("position",new st([0,0,0,0,1,0],3)),mo=new vr(.5,1,5,1),mo.translate(0,-.5,0)),this.position.copy(t),this.line=new si(ir,new kn({color:s,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Tt(mo,new Bn({color:s,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,r,a)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Hl.set(e.z,0,-e.x).normalize();let t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Hl,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}};function qo(i,e,t,n){let s=iu(n);switch(t){case Uo:return i*e;case Fo:return i*e/s.components*s.byteLength;case jr:return i*e/s.components*s.byteLength;case Oo:return i*e*2/s.components*s.byteLength;case ea:return i*e*2/s.components*s.byteLength;case No:return i*e*3/s.components*s.byteLength;case Yt:return i*e*4/s.components*s.byteLength;case ta:return i*e*4/s.components*s.byteLength;case bs:case Es:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ts:case ws:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ia:case ra:return Math.max(i,16)*Math.max(e,8)/4;case na:case sa:return Math.max(i,8)*Math.max(e,8)/2;case aa:case oa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case la:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ca:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ha:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case ua:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case da:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case fa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case pa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ma:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ga:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case _a:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case xa:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case va:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ya:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ma:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Sa:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ba:case Ea:case Ta:return Math.ceil(i/4)*Math.ceil(e/4)*16;case wa:case Aa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Ra:case Ca:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function iu(i){switch(i){case rn:case Io:return{byteLength:1,components:1};case Fi:case Po:case Oi:return{byteLength:2,components:1};case Kr:case Qr:return{byteLength:2,components:4};case Xn:case $r:case dn:return{byteLength:4,components:1};case Lo:case Do:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function sh(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function ru(i){let e=new WeakMap;function t(o,c){let l=o.array,h=o.usage,d=l.byteLength,f=i.createBuffer();i.bindBuffer(c,f),i.bufferData(c,l,h),o.onUploadCallback();let p;if(l instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=i.SHORT;else if(l instanceof Uint32Array)p=i.UNSIGNED_INT;else if(l instanceof Int32Array)p=i.INT;else if(l instanceof Int8Array)p=i.BYTE;else if(l instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,c,l){let h=c.array,d=c.updateRanges;if(i.bindBuffer(l,o),d.length===0)i.bufferSubData(l,0,h);else{d.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<d.length;p++){let g=d[f],x=d[p];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,d[f]=x)}d.length=f+1;for(let p=0,g=d.length;p<g;p++){let x=d[p];i.bufferSubData(l,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var au=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ou=`#ifdef USE_ALPHAHASH
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
#endif`,lu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,uu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,du=`#ifdef USE_AOMAP
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
#endif`,fu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,pu=`#ifdef USE_BATCHING
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
#endif`,mu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_u=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,vu=`#ifdef USE_IRIDESCENCE
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
#endif`,yu=`#ifdef USE_BUMPMAP
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
#endif`,Mu=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Su=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Eu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tu=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,wu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Au=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ru=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Cu=`#define PI 3.141592653589793
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
} // validated`,Iu=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Pu=`vec3 transformedNormal = objectNormal;
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
#endif`,Lu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Du=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Uu=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Nu=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Fu="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ou=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Bu=`#ifdef USE_ENVMAP
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
#endif`,zu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ku=`#ifdef USE_ENVMAP
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
#endif`,Vu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Hu=`#ifdef USE_ENVMAP
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
#endif`,Gu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Wu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Xu=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Yu=`#ifdef USE_GRADIENTMAP
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
}`,Zu=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ju=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$u=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ku=`uniform bool receiveShadow;
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
#endif`,Qu=`#ifdef USE_ENVMAP
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
#endif`,ju=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ed=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,td=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,nd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,id=`PhysicalMaterial material;
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
#endif`,sd=`struct PhysicalMaterial {
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
}`,rd=`
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
#endif`,ad=`#if defined( RE_IndirectDiffuse )
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
#endif`,od=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ld=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cd=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hd=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ud=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,dd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,pd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,md=`#if defined( USE_POINTS_UV )
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
#endif`,gd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,_d=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,vd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,yd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Md=`#ifdef USE_MORPHTARGETS
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
#endif`,Sd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,bd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Ed=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Td=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ad=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Rd=`#ifdef USE_NORMALMAP
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
#endif`,Cd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Id=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Pd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ld=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Dd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ud=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Nd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Fd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Od=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Bd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,zd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,kd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Vd=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Hd=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Gd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Wd=`float getShadowMask() {
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
}`,Xd=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,qd=`#ifdef USE_SKINNING
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
#endif`,Yd=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Zd=`#ifdef USE_SKINNING
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
#endif`,Jd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$d=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Kd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Qd=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,jd=`#ifdef USE_TRANSMISSION
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
#endif`,ef=`#ifdef USE_TRANSMISSION
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
#endif`,tf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,nf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,sf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,rf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,af=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,of=`uniform sampler2D t2D;
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
}`,lf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cf=`#ifdef ENVMAP_TYPE_CUBE
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
}`,hf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,uf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,df=`#include <common>
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
}`,ff=`#if DEPTH_PACKING == 3200
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
}`,pf=`#define DISTANCE
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
}`,mf=`#define DISTANCE
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
}`,gf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_f=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xf=`uniform float scale;
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
}`,vf=`uniform vec3 diffuse;
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
}`,yf=`#include <common>
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
}`,Mf=`uniform vec3 diffuse;
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
}`,Sf=`#define LAMBERT
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
}`,bf=`#define LAMBERT
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
}`,Ef=`#define MATCAP
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
}`,Tf=`#define MATCAP
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
}`,wf=`#define NORMAL
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
}`,Af=`#define NORMAL
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
}`,Rf=`#define PHONG
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
}`,Cf=`#define PHONG
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
}`,If=`#define STANDARD
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
}`,Pf=`#define STANDARD
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
}`,Lf=`#define TOON
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
}`,Df=`#define TOON
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
}`,Uf=`uniform float size;
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
}`,Nf=`uniform vec3 diffuse;
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
}`,Ff=`#include <common>
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
}`,Of=`uniform vec3 color;
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
}`,Bf=`uniform float rotation;
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
}`,zf=`uniform vec3 diffuse;
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
}`,He={alphahash_fragment:au,alphahash_pars_fragment:ou,alphamap_fragment:lu,alphamap_pars_fragment:cu,alphatest_fragment:hu,alphatest_pars_fragment:uu,aomap_fragment:du,aomap_pars_fragment:fu,batching_pars_vertex:pu,batching_vertex:mu,begin_vertex:gu,beginnormal_vertex:_u,bsdfs:xu,iridescence_fragment:vu,bumpmap_pars_fragment:yu,clipping_planes_fragment:Mu,clipping_planes_pars_fragment:Su,clipping_planes_pars_vertex:bu,clipping_planes_vertex:Eu,color_fragment:Tu,color_pars_fragment:wu,color_pars_vertex:Au,color_vertex:Ru,common:Cu,cube_uv_reflection_fragment:Iu,defaultnormal_vertex:Pu,displacementmap_pars_vertex:Lu,displacementmap_vertex:Du,emissivemap_fragment:Uu,emissivemap_pars_fragment:Nu,colorspace_fragment:Fu,colorspace_pars_fragment:Ou,envmap_fragment:Bu,envmap_common_pars_fragment:zu,envmap_pars_fragment:ku,envmap_pars_vertex:Vu,envmap_physical_pars_fragment:Qu,envmap_vertex:Hu,fog_vertex:Gu,fog_pars_vertex:Wu,fog_fragment:Xu,fog_pars_fragment:qu,gradientmap_pars_fragment:Yu,lightmap_pars_fragment:Zu,lights_lambert_fragment:Ju,lights_lambert_pars_fragment:$u,lights_pars_begin:Ku,lights_toon_fragment:ju,lights_toon_pars_fragment:ed,lights_phong_fragment:td,lights_phong_pars_fragment:nd,lights_physical_fragment:id,lights_physical_pars_fragment:sd,lights_fragment_begin:rd,lights_fragment_maps:ad,lights_fragment_end:od,logdepthbuf_fragment:ld,logdepthbuf_pars_fragment:cd,logdepthbuf_pars_vertex:hd,logdepthbuf_vertex:ud,map_fragment:dd,map_pars_fragment:fd,map_particle_fragment:pd,map_particle_pars_fragment:md,metalnessmap_fragment:gd,metalnessmap_pars_fragment:_d,morphinstance_vertex:xd,morphcolor_vertex:vd,morphnormal_vertex:yd,morphtarget_pars_vertex:Md,morphtarget_vertex:Sd,normal_fragment_begin:bd,normal_fragment_maps:Ed,normal_pars_fragment:Td,normal_pars_vertex:wd,normal_vertex:Ad,normalmap_pars_fragment:Rd,clearcoat_normal_fragment_begin:Cd,clearcoat_normal_fragment_maps:Id,clearcoat_pars_fragment:Pd,iridescence_pars_fragment:Ld,opaque_fragment:Dd,packing:Ud,premultiplied_alpha_fragment:Nd,project_vertex:Fd,dithering_fragment:Od,dithering_pars_fragment:Bd,roughnessmap_fragment:zd,roughnessmap_pars_fragment:kd,shadowmap_pars_fragment:Vd,shadowmap_pars_vertex:Hd,shadowmap_vertex:Gd,shadowmask_pars_fragment:Wd,skinbase_vertex:Xd,skinning_pars_vertex:qd,skinning_vertex:Yd,skinnormal_vertex:Zd,specularmap_fragment:Jd,specularmap_pars_fragment:$d,tonemapping_fragment:Kd,tonemapping_pars_fragment:Qd,transmission_fragment:jd,transmission_pars_fragment:ef,uv_pars_fragment:tf,uv_pars_vertex:nf,uv_vertex:sf,worldpos_vertex:rf,background_vert:af,background_frag:of,backgroundCube_vert:lf,backgroundCube_frag:cf,cube_vert:hf,cube_frag:uf,depth_vert:df,depth_frag:ff,distanceRGBA_vert:pf,distanceRGBA_frag:mf,equirect_vert:gf,equirect_frag:_f,linedashed_vert:xf,linedashed_frag:vf,meshbasic_vert:yf,meshbasic_frag:Mf,meshlambert_vert:Sf,meshlambert_frag:bf,meshmatcap_vert:Ef,meshmatcap_frag:Tf,meshnormal_vert:wf,meshnormal_frag:Af,meshphong_vert:Rf,meshphong_frag:Cf,meshphysical_vert:If,meshphysical_frag:Pf,meshtoon_vert:Lf,meshtoon_frag:Df,points_vert:Uf,points_frag:Nf,shadow_vert:Ff,shadow_frag:Of,sprite_vert:Bf,sprite_frag:zf},he={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new Le(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Le(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},fn={basic:{uniforms:St([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:St([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Ve(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:St([he.common,he.specularmap,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.fog,he.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:St([he.common,he.envmap,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.roughnessmap,he.metalnessmap,he.fog,he.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:St([he.common,he.aomap,he.lightmap,he.emissivemap,he.bumpmap,he.normalmap,he.displacementmap,he.gradientmap,he.fog,he.lights,{emissive:{value:new Ve(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:St([he.common,he.bumpmap,he.normalmap,he.displacementmap,he.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:St([he.points,he.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:St([he.common,he.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:St([he.common,he.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:St([he.common,he.bumpmap,he.normalmap,he.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:St([he.sprite,he.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:St([he.common,he.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:St([he.lights,he.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};fn.physical={uniforms:St([fn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new Le(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new Le},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new Le},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};var Ia={r:0,b:0,g:0},di=new nn,kf=new it;function Vf(i,e,t,n,s,r,a){let o=new Ve(0),c=r===!0?0:1,l,h,d=null,f=0,p=null;function g(b){let S=b.isScene===!0?b.background:null;return S&&S.isTexture&&(S=(b.backgroundBlurriness>0?t:e).get(S)),S}function x(b){let S=!1,R=g(b);R===null?u(o,c):R&&R.isColor&&(u(R,1),S=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(b,S){let R=g(S);R&&(R.isCubeTexture||R.mapping===Ms)?(h===void 0&&(h=new Tt(new zn(1,1,1),new sn({name:"BackgroundCubeMaterial",uniforms:ui(fn.backgroundCube.uniforms),vertexShader:fn.backgroundCube.vertexShader,fragmentShader:fn.backgroundCube.fragmentShader,side:wt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,P,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),di.copy(S.backgroundRotation),di.x*=-1,di.y*=-1,di.z*=-1,R.isCubeTexture&&R.isRenderTargetTexture===!1&&(di.y*=-1,di.z*=-1),h.material.uniforms.envMap.value=R,h.material.uniforms.flipEnvMap.value=R.isCubeTexture&&R.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(kf.makeRotationFromEuler(di)),h.material.toneMapped=Ye.getTransfer(R.colorSpace)!==$e,(d!==R||f!==R.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,d=R,f=R.version,p=i.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):R&&R.isTexture&&(l===void 0&&(l=new Tt(new ri(2,2),new sn({name:"BackgroundMaterial",uniforms:ui(fn.background.uniforms),vertexShader:fn.background.vertexShader,fragmentShader:fn.background.fragmentShader,side:Mn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=R,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(R.colorSpace)!==$e,R.matrixAutoUpdate===!0&&R.updateMatrix(),l.material.uniforms.uvTransform.value.copy(R.matrix),(d!==R||f!==R.version||p!==i.toneMapping)&&(l.material.needsUpdate=!0,d=R,f=R.version,p=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function u(b,S){b.getRGB(Ia,Ho(i)),n.buffers.color.setClear(Ia.r,Ia.g,Ia.b,S,a)}function T(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,S=1){o.set(b),c=S,u(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(b){c=b,u(o,c)},render:x,addToRenderList:m,dispose:T}}function Hf(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,a=!1;function o(M,C,z,W,O){let X=!1,q=d(W,z,C);r!==q&&(r=q,l(r.object)),X=p(M,W,z,O),X&&g(M,W,z,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,S(M,C,z,W),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function c(){return i.createVertexArray()}function l(M){return i.bindVertexArray(M)}function h(M){return i.deleteVertexArray(M)}function d(M,C,z){let W=z.wireframe===!0,O=n[M.id];O===void 0&&(O={},n[M.id]=O);let X=O[C.id];X===void 0&&(X={},O[C.id]=X);let q=X[W];return q===void 0&&(q=f(c()),X[W]=q),q}function f(M){let C=[],z=[],W=[];for(let O=0;O<t;O++)C[O]=0,z[O]=0,W[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:z,attributeDivisors:W,object:M,attributes:{},index:null}}function p(M,C,z,W){let O=r.attributes,X=C.attributes,q=0,ie=z.getAttributes();for(let Y in ie)if(ie[Y].location>=0){let Z=O[Y],K=X[Y];if(K===void 0&&(Y==="instanceMatrix"&&M.instanceMatrix&&(K=M.instanceMatrix),Y==="instanceColor"&&M.instanceColor&&(K=M.instanceColor)),Z===void 0||Z.attribute!==K||K&&Z.data!==K.data)return!0;q++}return r.attributesNum!==q||r.index!==W}function g(M,C,z,W){let O={},X=C.attributes,q=0,ie=z.getAttributes();for(let Y in ie)if(ie[Y].location>=0){let Z=X[Y];Z===void 0&&(Y==="instanceMatrix"&&M.instanceMatrix&&(Z=M.instanceMatrix),Y==="instanceColor"&&M.instanceColor&&(Z=M.instanceColor));let K={};K.attribute=Z,Z&&Z.data&&(K.data=Z.data),O[Y]=K,q++}r.attributes=O,r.attributesNum=q,r.index=W}function x(){let M=r.newAttributes;for(let C=0,z=M.length;C<z;C++)M[C]=0}function m(M){u(M,0)}function u(M,C){let z=r.newAttributes,W=r.enabledAttributes,O=r.attributeDivisors;z[M]=1,W[M]===0&&(i.enableVertexAttribArray(M),W[M]=1),O[M]!==C&&(i.vertexAttribDivisor(M,C),O[M]=C)}function T(){let M=r.newAttributes,C=r.enabledAttributes;for(let z=0,W=C.length;z<W;z++)C[z]!==M[z]&&(i.disableVertexAttribArray(z),C[z]=0)}function b(M,C,z,W,O,X,q){q===!0?i.vertexAttribIPointer(M,C,z,O,X):i.vertexAttribPointer(M,C,z,W,O,X)}function S(M,C,z,W){x();let O=W.attributes,X=z.getAttributes(),q=C.defaultAttributeValues;for(let ie in X){let Y=X[ie];if(Y.location>=0){let V=O[ie];if(V===void 0&&(ie==="instanceMatrix"&&M.instanceMatrix&&(V=M.instanceMatrix),ie==="instanceColor"&&M.instanceColor&&(V=M.instanceColor)),V!==void 0){let Z=V.normalized,K=V.itemSize,me=e.get(V);if(me===void 0)continue;let Se=me.buffer,be=me.type,_e=me.bytesPerElement,D=be===i.INT||be===i.UNSIGNED_INT||V.gpuType===$r;if(V.isInterleavedBufferAttribute){let k=V.data,j=k.stride,pe=V.offset;if(k.isInstancedInterleavedBuffer){for(let ae=0;ae<Y.locationSize;ae++)u(Y.location+ae,k.meshPerAttribute);M.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=k.meshPerAttribute*k.count)}else for(let ae=0;ae<Y.locationSize;ae++)m(Y.location+ae);i.bindBuffer(i.ARRAY_BUFFER,Se);for(let ae=0;ae<Y.locationSize;ae++)b(Y.location+ae,K/Y.locationSize,be,Z,j*_e,(pe+K/Y.locationSize*ae)*_e,D)}else{if(V.isInstancedBufferAttribute){for(let k=0;k<Y.locationSize;k++)u(Y.location+k,V.meshPerAttribute);M.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let k=0;k<Y.locationSize;k++)m(Y.location+k);i.bindBuffer(i.ARRAY_BUFFER,Se);for(let k=0;k<Y.locationSize;k++)b(Y.location+k,K/Y.locationSize,be,Z,K*_e,K/Y.locationSize*k*_e,D)}}else if(q!==void 0){let Z=q[ie];if(Z!==void 0)switch(Z.length){case 2:i.vertexAttrib2fv(Y.location,Z);break;case 3:i.vertexAttrib3fv(Y.location,Z);break;case 4:i.vertexAttrib4fv(Y.location,Z);break;default:i.vertexAttrib1fv(Y.location,Z)}}}}T()}function R(){U();for(let M in n){let C=n[M];for(let z in C){let W=C[z];for(let O in W)h(W[O].object),delete W[O];delete C[z]}delete n[M]}}function A(M){if(n[M.id]===void 0)return;let C=n[M.id];for(let z in C){let W=C[z];for(let O in W)h(W[O].object),delete W[O];delete C[z]}delete n[M.id]}function P(M){for(let C in n){let z=n[C];if(z[M.id]===void 0)continue;let W=z[M.id];for(let O in W)h(W[O].object),delete W[O];delete z[M.id]}}function U(){y(),a=!0,r!==s&&(r=s,l(r.object))}function y(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:U,resetDefaultState:y,dispose:R,releaseStatesOfGeometry:A,releaseStatesOfProgram:P,initAttributes:x,enableAttribute:m,disableUnusedAttributes:T}}function Gf(i,e,t){let n;function s(l){n=l}function r(l,h){i.drawArrays(n,l,h),t.update(h,n,1)}function a(l,h,d){d!==0&&(i.drawArraysInstanced(n,l,h,d),t.update(h,n,d))}function o(l,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,d);let p=0;for(let g=0;g<d;g++)p+=h[g];t.update(p,n,1)}function c(l,h,d,f){if(d===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)a(l[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,l,0,h,0,f,0,d);let g=0;for(let x=0;x<d;x++)g+=h[x]*f[x];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function Wf(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let P=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==Yt&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let U=P===Oi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==rn&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==dn&&!U)}function c(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let d=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),u=i.getParameter(i.MAX_VERTEX_ATTRIBS),T=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:u,maxVertexUniforms:T,maxVaryings:b,maxFragmentUniforms:S,vertexTextures:R,maxSamples:A}}function Xf(i){let e=this,t=null,n=0,s=!1,r=!1,a=new ln,o=new ze,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){let p=d.length!==0||f||n!==0||s;return s=f,n=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){t=h(d,f,0)},this.setState=function(d,f,p){let g=d.clippingPlanes,x=d.clipIntersection,m=d.clipShadows,u=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{let T=r?0:n,b=T*4,S=u.clippingState||null;c.value=S,S=h(g,f,b,p);for(let R=0;R!==b;++R)S[R]=t[R];u.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=T}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,f,p,g){let x=d!==null?d.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let u=p+x*4,T=f.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<u)&&(m=new Float32Array(u));for(let b=0,S=p;b!==x;++b,S+=4)a.copy(d[b]).applyMatrix4(T,o),a.normal.toArray(m,S),m[S+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function qf(i){let e=new WeakMap;function t(a,o){return o===Yr?a.mapping=ci:o===Zr&&(a.mapping=hi),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Yr||o===Zr)if(e.has(a)){let c=e.get(a).texture;return t(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let l=new mr(c.height);return l.fromEquirectangularTexture(i,a),e.set(a,l),a.addEventListener("dispose",s),t(l.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Vi=4,Nc=[.125,.215,.35,.446,.526,.582],mi=20,Yo=new li,Fc=new Ve,Zo=null,Jo=0,$o=0,Ko=!1,pi=(1+Math.sqrt(5))/2,ki=1/pi,Oc=[new I(-pi,ki,0),new I(pi,ki,0),new I(-ki,0,pi),new I(ki,0,pi),new I(0,pi,-ki),new I(0,pi,ki),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],Yf=new I,Da=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Yf}=r;Zo=this._renderer.getRenderTarget(),Jo=this._renderer.getActiveCubeFace(),$o=this._renderer.getActiveMipmapLevel(),Ko=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Zo,Jo,$o),this._renderer.xr.enabled=Ko,e.scissorTest=!1,Pa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ci||e.mapping===hi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zo=this._renderer.getRenderTarget(),Jo=this._renderer.getActiveCubeFace(),$o=this._renderer.getActiveMipmapLevel(),Ko=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:en,minFilter:en,generateMipmaps:!1,type:Oi,format:Yt,colorSpace:ni,depthBuffer:!1},s=Bc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bc(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zf(r)),this._blurMaterial=Jf(r,e,t)}return s}_compileMaterial(e){let t=new Tt(this._lodPlanes[0],e);this._renderer.compile(t,Yo)}_sceneToCubeUV(e,t,n,s,r){let c=new It(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,f=d.autoClear,p=d.toneMapping;d.getClearColor(Fc),d.toneMapping=Tn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null));let x=new Bn({name:"PMREM.Background",side:wt,depthWrite:!1,depthTest:!1}),m=new Tt(new zn,x),u=!1,T=e.background;T?T.isColor&&(x.color.copy(T),e.background=null,u=!0):(x.color.copy(Fc),u=!0);for(let b=0;b<6;b++){let S=b%3;S===0?(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[b],r.y,r.z)):S===1?(c.up.set(0,0,l[b]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[b],r.z)):(c.up.set(0,l[b],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[b]));let R=this._cubeSize;Pa(s,S*R,b>2?R:0,R,R),d.setRenderTarget(s),u&&d.render(m,c),d.render(e,c)}m.geometry.dispose(),m.material.dispose(),d.toneMapping=p,d.autoClear=f,e.background=T}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ci||e.mapping===hi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=kc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zc());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new Tt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;Pa(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Yo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Oc[(s-r-1)%Oc.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,d=new Tt(this._lodPlanes[s],l),f=l.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*mi-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):mi;m>mi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${mi}`);let u=[],T=0;for(let P=0;P<mi;++P){let U=P/x,y=Math.exp(-U*U/2);u.push(y),P===0?T+=y:P<m&&(T+=2*y)}for(let P=0;P<u.length;P++)u[P]=u[P]/T;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=u,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);let{_lodMax:b}=this;f.dTheta.value=g,f.mipInt.value=b-n;let S=this._sizeLods[s],R=3*S*(s>b-Vi?s-b+Vi:0),A=4*(this._cubeSize-S);Pa(t,R,A,3*S,2*S),c.setRenderTarget(t),c.render(d,Yo)}};function Zf(i){let e=[],t=[],n=[],s=i,r=i-Vi+1+Nc.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);t.push(o);let c=1/o;a>i-Vi?c=Nc[a-i+Vi-1]:a===0&&(c=0),n.push(c);let l=1/(o-2),h=-l,d=1+l,f=[h,h,d,h,d,d,h,h,d,d,h,d],p=6,g=6,x=3,m=2,u=1,T=new Float32Array(x*g*p),b=new Float32Array(m*g*p),S=new Float32Array(u*g*p);for(let A=0;A<p;A++){let P=A%3*2/3-1,U=A>2?0:-1,y=[P,U,0,P+2/3,U,0,P+2/3,U+1,0,P,U,0,P+2/3,U+1,0,P,U+1,0];T.set(y,x*g*A),b.set(f,m*g*A);let M=[A,A,A,A,A,A];S.set(M,u*g*A)}let R=new pt;R.setAttribute("position",new xt(T,x)),R.setAttribute("uv",new xt(b,m)),R.setAttribute("faceIndex",new xt(S,u)),e.push(R),s>Vi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Bc(i,e,t){let n=new cn(i,e,t);return n.texture.mapping=Ms,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Pa(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Jf(i,e,t){let n=new Float32Array(mi),s=new I(0,1,0);return new sn({name:"SphericalGaussianBlur",defines:{n:mi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ol(),fragmentShader:`

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
		`,blending:En,depthTest:!1,depthWrite:!1})}function zc(){return new sn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ol(),fragmentShader:`

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
		`,blending:En,depthTest:!1,depthWrite:!1})}function kc(){return new sn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:En,depthTest:!1,depthWrite:!1})}function ol(){return`

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
	`}function $f(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let c=o.mapping,l=c===Yr||c===Zr,h=c===ci||c===hi;if(l||h){let d=e.get(o),f=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new Da(i)),d=l?t.fromEquirectangular(o,d):t.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),d.texture;if(d!==void 0)return d.texture;{let p=o.image;return l&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new Da(i)),d=l?t.fromEquirectangular(o):t.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,e.set(o,d),o.addEventListener("dispose",r),d.texture):null}}}return o}function s(o){let c=0,l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){let c=o.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function Kf(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Pi("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Qf(i,e,t,n){let s={},r=new WeakMap;function a(d){let f=d.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete s[f.id];let p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(d,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function c(d){let f=d.attributes;for(let p in f)e.update(f[p],i.ARRAY_BUFFER)}function l(d){let f=[],p=d.index,g=d.attributes.position,x=0;if(p!==null){let T=p.array;x=p.version;for(let b=0,S=T.length;b<S;b+=3){let R=T[b+0],A=T[b+1],P=T[b+2];f.push(R,A,A,P,P,R)}}else if(g!==void 0){let T=g.array;x=g.version;for(let b=0,S=T.length/3-1;b<S;b+=3){let R=b+0,A=b+1,P=b+2;f.push(R,A,A,P,P,R)}}else return;let m=new(Vo(f)?os:as)(f,1);m.version=x;let u=r.get(d);u&&e.remove(u),r.set(d,m)}function h(d){let f=r.get(d);if(f){let p=d.index;p!==null&&f.version<p.version&&l(d)}else l(d);return r.get(d)}return{get:o,update:c,getWireframeAttribute:h}}function jf(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,p){i.drawElements(n,p,r,f*a),t.update(p,n,1)}function l(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*a,g),t.update(p,n,g))}function h(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let u=0;u<g;u++)m+=p[u];t.update(m,n,1)}function d(f,p,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let u=0;u<f.length;u++)l(f[u]/a,p[u],x[u]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,x,0,g);let u=0;for(let T=0;T<g;T++)u+=p[T]*x[T];t.update(u,n,1)}}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function ep(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function tp(i,e,t){let n=new WeakMap,s=new lt;function r(a,o,c){let l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,f=n.get(o);if(f===void 0||f.count!==d){let y=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",y)};f!==void 0&&f.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],u=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],b=0;p===!0&&(b=1),g===!0&&(b=2),x===!0&&(b=3);let S=o.attributes.position.count*b,R=1;S>e.maxTextureSize&&(R=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);let A=new Float32Array(S*R*4*d),P=new is(A,S,R,d);P.type=dn,P.needsUpdate=!0;let U=b*4;for(let M=0;M<d;M++){let C=m[M],z=u[M],W=T[M],O=S*R*4*M;for(let X=0;X<C.count;X++){let q=X*U;p===!0&&(s.fromBufferAttribute(C,X),A[O+q+0]=s.x,A[O+q+1]=s.y,A[O+q+2]=s.z,A[O+q+3]=0),g===!0&&(s.fromBufferAttribute(z,X),A[O+q+4]=s.x,A[O+q+5]=s.y,A[O+q+6]=s.z,A[O+q+7]=0),x===!0&&(s.fromBufferAttribute(W,X),A[O+q+8]=s.x,A[O+q+9]=s.y,A[O+q+10]=s.z,A[O+q+11]=W.itemSize===4?s.w:1)}}f={count:d,texture:P,size:new Le(S,R)},n.set(o,f),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let x=0;x<l.length;x++)p+=l[x];let g=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function np(i,e,t,n){let s=new WeakMap;function r(c){let l=n.render.frame,h=c.geometry,d=e.get(c,h);if(s.get(d)!==l&&(e.update(d),s.set(d,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==l&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return d}function a(){s=new WeakMap}function o(c){let l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:a}}var rh=new Ot,Vc=new us(1,1),ah=new is,oh=new fr,lh=new cs,Hc=[],Gc=[],Wc=new Float32Array(16),Xc=new Float32Array(9),qc=new Float32Array(4);function Gi(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Hc[s];if(r===void 0&&(r=new Float32Array(s),Hc[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function gt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Na(i,e){let t=Gc[e];t===void 0&&(t=new Int32Array(e),Gc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ip(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function sp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;i.uniform2fv(this.addr,e),gt(t,e)}}function rp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(mt(t,e))return;i.uniform3fv(this.addr,e),gt(t,e)}}function ap(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;i.uniform4fv(this.addr,e),gt(t,e)}}function op(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),gt(t,e)}else{if(mt(t,n))return;qc.set(n),i.uniformMatrix2fv(this.addr,!1,qc),gt(t,n)}}function lp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),gt(t,e)}else{if(mt(t,n))return;Xc.set(n),i.uniformMatrix3fv(this.addr,!1,Xc),gt(t,n)}}function cp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),gt(t,e)}else{if(mt(t,n))return;Wc.set(n),i.uniformMatrix4fv(this.addr,!1,Wc),gt(t,n)}}function hp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function up(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;i.uniform2iv(this.addr,e),gt(t,e)}}function dp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(mt(t,e))return;i.uniform3iv(this.addr,e),gt(t,e)}}function fp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;i.uniform4iv(this.addr,e),gt(t,e)}}function pp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function mp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(mt(t,e))return;i.uniform2uiv(this.addr,e),gt(t,e)}}function gp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(mt(t,e))return;i.uniform3uiv(this.addr,e),gt(t,e)}}function _p(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(mt(t,e))return;i.uniform4uiv(this.addr,e),gt(t,e)}}function xp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Vc.compareFunction=zo,r=Vc):r=rh,t.setTexture2D(e||r,s)}function vp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||oh,s)}function yp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||lh,s)}function Mp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||ah,s)}function Sp(i){switch(i){case 5126:return ip;case 35664:return sp;case 35665:return rp;case 35666:return ap;case 35674:return op;case 35675:return lp;case 35676:return cp;case 5124:case 35670:return hp;case 35667:case 35671:return up;case 35668:case 35672:return dp;case 35669:case 35673:return fp;case 5125:return pp;case 36294:return mp;case 36295:return gp;case 36296:return _p;case 35678:case 36198:case 36298:case 36306:case 35682:return xp;case 35679:case 36299:case 36307:return vp;case 35680:case 36300:case 36308:case 36293:return yp;case 36289:case 36303:case 36311:case 36292:return Mp}}function bp(i,e){i.uniform1fv(this.addr,e)}function Ep(i,e){let t=Gi(e,this.size,2);i.uniform2fv(this.addr,t)}function Tp(i,e){let t=Gi(e,this.size,3);i.uniform3fv(this.addr,t)}function wp(i,e){let t=Gi(e,this.size,4);i.uniform4fv(this.addr,t)}function Ap(i,e){let t=Gi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Rp(i,e){let t=Gi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Cp(i,e){let t=Gi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ip(i,e){i.uniform1iv(this.addr,e)}function Pp(i,e){i.uniform2iv(this.addr,e)}function Lp(i,e){i.uniform3iv(this.addr,e)}function Dp(i,e){i.uniform4iv(this.addr,e)}function Up(i,e){i.uniform1uiv(this.addr,e)}function Np(i,e){i.uniform2uiv(this.addr,e)}function Fp(i,e){i.uniform3uiv(this.addr,e)}function Op(i,e){i.uniform4uiv(this.addr,e)}function Bp(i,e,t){let n=this.cache,s=e.length,r=Na(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||rh,r[a])}function zp(i,e,t){let n=this.cache,s=e.length,r=Na(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||oh,r[a])}function kp(i,e,t){let n=this.cache,s=e.length,r=Na(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||lh,r[a])}function Vp(i,e,t){let n=this.cache,s=e.length,r=Na(t,s);mt(n,r)||(i.uniform1iv(this.addr,r),gt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||ah,r[a])}function Hp(i){switch(i){case 5126:return bp;case 35664:return Ep;case 35665:return Tp;case 35666:return wp;case 35674:return Ap;case 35675:return Rp;case 35676:return Cp;case 5124:case 35670:return Ip;case 35667:case 35671:return Pp;case 35668:case 35672:return Lp;case 35669:case 35673:return Dp;case 5125:return Up;case 36294:return Np;case 36295:return Fp;case 36296:return Op;case 35678:case 36198:case 36298:case 36306:case 35682:return Bp;case 35679:case 36299:case 36307:return zp;case 35680:case 36300:case 36308:case 36293:return kp;case 36289:case 36303:case 36311:case 36292:return Vp}}var jo=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Sp(t.type)}},el=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Hp(t.type)}},tl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Qo=/(\w+)(\])?(\[|\.)?/g;function Yc(i,e){i.seq.push(e),i.map[e.id]=e}function Gp(i,e,t){let n=i.name,s=n.length;for(Qo.lastIndex=0;;){let r=Qo.exec(n),a=Qo.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){Yc(t,l===void 0?new jo(o,i,e):new el(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new tl(o),Yc(t,d)),t=d}}}var Hi=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);Gp(r,a,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Zc(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Wp=37297,Xp=0;function qp(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Jc=new ze;function Yp(i){Ye._getMatrix(Jc,Ye.workingColorSpace,i);let e=`mat3( ${Jc.elements.map(t=>t.toFixed(4))} )`;switch(Ye.getTransfer(i)){case es:return[e,"LinearTransferOETF"];case $e:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function $c(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+qp(i.getShaderSource(e),o)}else return r}function Zp(i,e){let t=Yp(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Jp(i,e){let t;switch(e){case dc:t="Linear";break;case fc:t="Reinhard";break;case pc:t="Cineon";break;case mc:t="ACESFilmic";break;case _c:t="AgX";break;case xc:t="Neutral";break;case gc:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var La=new I;function $p(){Ye.getLuminanceCoefficients(La);let i=La.x.toFixed(4),e=La.y.toFixed(4),t=La.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Kp(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Rs).join(`
`)}function Qp(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function jp(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Rs(i){return i!==""}function Kc(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Qc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var em=/^[ \t]*#include +<([\w\d./]+)>/gm;function nl(i){return i.replace(em,nm)}var tm=new Map;function nm(i,e){let t=He[e];if(t===void 0){let n=tm.get(e);if(n!==void 0)t=He[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return nl(t)}var im=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function jc(i){return i.replace(im,sm)}function sm(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function eh(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function rm(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===To?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Xl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===un&&(e="SHADOWMAP_TYPE_VSM"),e}function am(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ci:case hi:e="ENVMAP_TYPE_CUBE";break;case Ms:e="ENVMAP_TYPE_CUBE_UV";break}return e}function om(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case hi:e="ENVMAP_MODE_REFRACTION";break}return e}function lm(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case qr:e="ENVMAP_BLENDING_MULTIPLY";break;case hc:e="ENVMAP_BLENDING_MIX";break;case uc:e="ENVMAP_BLENDING_ADD";break}return e}function cm(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function hm(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=rm(t),l=am(t),h=om(t),d=lm(t),f=cm(t),p=Kp(t),g=Qp(r),x=s.createProgram(),m,u,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Rs).join(`
`),m.length>0&&(m+=`
`),u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Rs).join(`
`),u.length>0&&(u+=`
`)):(m=[eh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Rs).join(`
`),u=[eh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Tn?"#define TONE_MAPPING":"",t.toneMapping!==Tn?He.tonemapping_pars_fragment:"",t.toneMapping!==Tn?Jp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,Zp("linearToOutputTexel",t.outputColorSpace),$p(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Rs).join(`
`)),a=nl(a),a=Kc(a,t),a=Qc(a,t),o=nl(o),o=Kc(o,t),o=Qc(o,t),a=jc(a),o=jc(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,u=["#define varying in",t.glslVersion===ko?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ko?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+u);let b=T+m+a,S=T+u+o,R=Zc(s,s.VERTEX_SHADER,b),A=Zc(s,s.FRAGMENT_SHADER,S);s.attachShader(x,R),s.attachShader(x,A),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function P(C){if(i.debug.checkShaderErrors){let z=s.getProgramInfoLog(x)||"",W=s.getShaderInfoLog(R)||"",O=s.getShaderInfoLog(A)||"",X=z.trim(),q=W.trim(),ie=O.trim(),Y=!0,V=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(Y=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,R,A);else{let Z=$c(s,R,"vertex"),K=$c(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+X+`
`+Z+`
`+K)}else X!==""?console.warn("THREE.WebGLProgram: Program Info Log:",X):(q===""||ie==="")&&(V=!1);V&&(C.diagnostics={runnable:Y,programLog:X,vertexShader:{log:q,prefix:m},fragmentShader:{log:ie,prefix:u}})}s.deleteShader(R),s.deleteShader(A),U=new Hi(s,x),y=jp(s,x)}let U;this.getUniforms=function(){return U===void 0&&P(this),U};let y;this.getAttributes=function(){return y===void 0&&P(this),y};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(x,Wp)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xp++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=R,this.fragmentShader=A,this}var um=0,il=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new sl(e),t.set(e,n)),n}},sl=class{constructor(e){this.id=um++,this.code=e,this.usedTimes=0}};function dm(i,e,t,n,s,r,a){let o=new rs,c=new il,l=new Set,h=[],d=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(y){return l.add(y),y===0?"uv":`uv${y}`}function m(y,M,C,z,W){let O=z.fog,X=W.geometry,q=y.isMeshStandardMaterial?z.environment:null,ie=(y.isMeshStandardMaterial?t:e).get(y.envMap||q),Y=ie&&ie.mapping===Ms?ie.image.height:null,V=g[y.type];y.precision!==null&&(p=s.getMaxPrecision(y.precision),p!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",p,"instead."));let Z=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,K=Z!==void 0?Z.length:0,me=0;X.morphAttributes.position!==void 0&&(me=1),X.morphAttributes.normal!==void 0&&(me=2),X.morphAttributes.color!==void 0&&(me=3);let Se,be,_e,D;if(V){let Je=fn[V];Se=Je.vertexShader,be=Je.fragmentShader}else Se=y.vertexShader,be=y.fragmentShader,c.update(y),_e=c.getVertexShaderID(y),D=c.getFragmentShaderID(y);let k=i.getRenderTarget(),j=i.state.buffers.depth.getReversed(),pe=W.isInstancedMesh===!0,ae=W.isBatchedMesh===!0,Ne=!!y.map,ht=!!y.matcap,w=!!ie,We=!!y.aoMap,Re=!!y.lightMap,Ce=!!y.bumpMap,ce=!!y.normalMap,qe=!!y.displacementMap,ge=!!y.emissiveMap,Oe=!!y.metalnessMap,rt=!!y.roughnessMap,je=y.anisotropy>0,E=y.clearcoat>0,_=y.dispersion>0,B=y.iridescence>0,$=y.sheen>0,ee=y.transmission>0,J=je&&!!y.anisotropyMap,Ae=E&&!!y.clearcoatMap,oe=E&&!!y.clearcoatNormalMap,Ee=E&&!!y.clearcoatRoughnessMap,Te=B&&!!y.iridescenceMap,se=B&&!!y.iridescenceThicknessMap,fe=$&&!!y.sheenColorMap,Ue=$&&!!y.sheenRoughnessMap,we=!!y.specularMap,ue=!!y.specularColorMap,ke=!!y.specularIntensityMap,L=ee&&!!y.transmissionMap,re=ee&&!!y.thicknessMap,le=!!y.gradientMap,ve=!!y.alphaMap,te=y.alphaTest>0,Q=!!y.alphaHash,Me=!!y.extensions,Be=Tn;y.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Be=i.toneMapping);let et={shaderID:V,shaderType:y.type,shaderName:y.name,vertexShader:Se,fragmentShader:be,defines:y.defines,customVertexShaderID:_e,customFragmentShaderID:D,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:p,batching:ae,batchingColor:ae&&W._colorsTexture!==null,instancing:pe,instancingColor:pe&&W.instanceColor!==null,instancingMorph:pe&&W.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:k===null?i.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:ni,alphaToCoverage:!!y.alphaToCoverage,map:Ne,matcap:ht,envMap:w,envMapMode:w&&ie.mapping,envMapCubeUVHeight:Y,aoMap:We,lightMap:Re,bumpMap:Ce,normalMap:ce,displacementMap:f&&qe,emissiveMap:ge,normalMapObjectSpace:ce&&y.normalMapType===Sc,normalMapTangentSpace:ce&&y.normalMapType===Bo,metalnessMap:Oe,roughnessMap:rt,anisotropy:je,anisotropyMap:J,clearcoat:E,clearcoatMap:Ae,clearcoatNormalMap:oe,clearcoatRoughnessMap:Ee,dispersion:_,iridescence:B,iridescenceMap:Te,iridescenceThicknessMap:se,sheen:$,sheenColorMap:fe,sheenRoughnessMap:Ue,specularMap:we,specularColorMap:ue,specularIntensityMap:ke,transmission:ee,transmissionMap:L,thicknessMap:re,gradientMap:le,opaque:y.transparent===!1&&y.blending===ei&&y.alphaToCoverage===!1,alphaMap:ve,alphaTest:te,alphaHash:Q,combine:y.combine,mapUv:Ne&&x(y.map.channel),aoMapUv:We&&x(y.aoMap.channel),lightMapUv:Re&&x(y.lightMap.channel),bumpMapUv:Ce&&x(y.bumpMap.channel),normalMapUv:ce&&x(y.normalMap.channel),displacementMapUv:qe&&x(y.displacementMap.channel),emissiveMapUv:ge&&x(y.emissiveMap.channel),metalnessMapUv:Oe&&x(y.metalnessMap.channel),roughnessMapUv:rt&&x(y.roughnessMap.channel),anisotropyMapUv:J&&x(y.anisotropyMap.channel),clearcoatMapUv:Ae&&x(y.clearcoatMap.channel),clearcoatNormalMapUv:oe&&x(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&x(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Te&&x(y.iridescenceMap.channel),iridescenceThicknessMapUv:se&&x(y.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&x(y.sheenColorMap.channel),sheenRoughnessMapUv:Ue&&x(y.sheenRoughnessMap.channel),specularMapUv:we&&x(y.specularMap.channel),specularColorMapUv:ue&&x(y.specularColorMap.channel),specularIntensityMapUv:ke&&x(y.specularIntensityMap.channel),transmissionMapUv:L&&x(y.transmissionMap.channel),thicknessMapUv:re&&x(y.thicknessMap.channel),alphaMapUv:ve&&x(y.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(ce||je),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!X.attributes.uv&&(Ne||ve),fog:!!O,useFog:y.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:W.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:K,morphTextureStride:me,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Be,decodeVideoTexture:Ne&&y.map.isVideoTexture===!0&&Ye.getTransfer(y.map.colorSpace)===$e,decodeVideoTextureEmissive:ge&&y.emissiveMap.isVideoTexture===!0&&Ye.getTransfer(y.emissiveMap.colorSpace)===$e,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===qt,flipSided:y.side===wt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:Me&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Me&&y.extensions.multiDraw===!0||ae)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return et.vertexUv1s=l.has(1),et.vertexUv2s=l.has(2),et.vertexUv3s=l.has(3),l.clear(),et}function u(y){let M=[];if(y.shaderID?M.push(y.shaderID):(M.push(y.customVertexShaderID),M.push(y.customFragmentShaderID)),y.defines!==void 0)for(let C in y.defines)M.push(C),M.push(y.defines[C]);return y.isRawShaderMaterial===!1&&(T(M,y),b(M,y),M.push(i.outputColorSpace)),M.push(y.customProgramCacheKey),M.join()}function T(y,M){y.push(M.precision),y.push(M.outputColorSpace),y.push(M.envMapMode),y.push(M.envMapCubeUVHeight),y.push(M.mapUv),y.push(M.alphaMapUv),y.push(M.lightMapUv),y.push(M.aoMapUv),y.push(M.bumpMapUv),y.push(M.normalMapUv),y.push(M.displacementMapUv),y.push(M.emissiveMapUv),y.push(M.metalnessMapUv),y.push(M.roughnessMapUv),y.push(M.anisotropyMapUv),y.push(M.clearcoatMapUv),y.push(M.clearcoatNormalMapUv),y.push(M.clearcoatRoughnessMapUv),y.push(M.iridescenceMapUv),y.push(M.iridescenceThicknessMapUv),y.push(M.sheenColorMapUv),y.push(M.sheenRoughnessMapUv),y.push(M.specularMapUv),y.push(M.specularColorMapUv),y.push(M.specularIntensityMapUv),y.push(M.transmissionMapUv),y.push(M.thicknessMapUv),y.push(M.combine),y.push(M.fogExp2),y.push(M.sizeAttenuation),y.push(M.morphTargetsCount),y.push(M.morphAttributeCount),y.push(M.numDirLights),y.push(M.numPointLights),y.push(M.numSpotLights),y.push(M.numSpotLightMaps),y.push(M.numHemiLights),y.push(M.numRectAreaLights),y.push(M.numDirLightShadows),y.push(M.numPointLightShadows),y.push(M.numSpotLightShadows),y.push(M.numSpotLightShadowsWithMaps),y.push(M.numLightProbes),y.push(M.shadowMapType),y.push(M.toneMapping),y.push(M.numClippingPlanes),y.push(M.numClipIntersection),y.push(M.depthPacking)}function b(y,M){o.disableAll(),M.supportsVertexTextures&&o.enable(0),M.instancing&&o.enable(1),M.instancingColor&&o.enable(2),M.instancingMorph&&o.enable(3),M.matcap&&o.enable(4),M.envMap&&o.enable(5),M.normalMapObjectSpace&&o.enable(6),M.normalMapTangentSpace&&o.enable(7),M.clearcoat&&o.enable(8),M.iridescence&&o.enable(9),M.alphaTest&&o.enable(10),M.vertexColors&&o.enable(11),M.vertexAlphas&&o.enable(12),M.vertexUv1s&&o.enable(13),M.vertexUv2s&&o.enable(14),M.vertexUv3s&&o.enable(15),M.vertexTangents&&o.enable(16),M.anisotropy&&o.enable(17),M.alphaHash&&o.enable(18),M.batching&&o.enable(19),M.dispersion&&o.enable(20),M.batchingColor&&o.enable(21),M.gradientMap&&o.enable(22),y.push(o.mask),o.disableAll(),M.fog&&o.enable(0),M.useFog&&o.enable(1),M.flatShading&&o.enable(2),M.logarithmicDepthBuffer&&o.enable(3),M.reversedDepthBuffer&&o.enable(4),M.skinning&&o.enable(5),M.morphTargets&&o.enable(6),M.morphNormals&&o.enable(7),M.morphColors&&o.enable(8),M.premultipliedAlpha&&o.enable(9),M.shadowMapEnabled&&o.enable(10),M.doubleSided&&o.enable(11),M.flipSided&&o.enable(12),M.useDepthPacking&&o.enable(13),M.dithering&&o.enable(14),M.transmission&&o.enable(15),M.sheen&&o.enable(16),M.opaque&&o.enable(17),M.pointsUvs&&o.enable(18),M.decodeVideoTexture&&o.enable(19),M.decodeVideoTextureEmissive&&o.enable(20),M.alphaToCoverage&&o.enable(21),y.push(o.mask)}function S(y){let M=g[y.type],C;if(M){let z=fn[M];C=Dc.clone(z.uniforms)}else C=y.uniforms;return C}function R(y,M){let C;for(let z=0,W=h.length;z<W;z++){let O=h[z];if(O.cacheKey===M){C=O,++C.usedTimes;break}}return C===void 0&&(C=new hm(i,M,y,r),h.push(C)),C}function A(y){if(--y.usedTimes===0){let M=h.indexOf(y);h[M]=h[h.length-1],h.pop(),y.destroy()}}function P(y){c.remove(y)}function U(){c.dispose()}return{getParameters:m,getProgramCacheKey:u,getUniforms:S,acquireProgram:R,releaseProgram:A,releaseShaderCache:P,programs:h,dispose:U}}function fm(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function pm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function th(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function nh(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d,f,p,g,x,m){let u=i[e];return u===void 0?(u={id:d.id,object:d,geometry:f,material:p,groupOrder:g,renderOrder:d.renderOrder,z:x,group:m},i[e]=u):(u.id=d.id,u.object=d,u.geometry=f,u.material=p,u.groupOrder=g,u.renderOrder=d.renderOrder,u.z=x,u.group=m),e++,u}function o(d,f,p,g,x,m){let u=a(d,f,p,g,x,m);p.transmission>0?n.push(u):p.transparent===!0?s.push(u):t.push(u)}function c(d,f,p,g,x,m){let u=a(d,f,p,g,x,m);p.transmission>0?n.unshift(u):p.transparent===!0?s.unshift(u):t.unshift(u)}function l(d,f){t.length>1&&t.sort(d||pm),n.length>1&&n.sort(f||th),s.length>1&&s.sort(f||th)}function h(){for(let d=e,f=i.length;d<f;d++){let p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:c,finish:h,sort:l}}function mm(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new nh,i.set(n,[a])):s>=r.length?(a=new nh,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function gm(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Ve};break;case"SpotLight":t={position:new I,direction:new I,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function _m(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Le,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var xm=0;function vm(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function ym(i){let e=new gm,t=_m(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new I);let s=new I,r=new it,a=new it;function o(l){let h=0,d=0,f=0;for(let y=0;y<9;y++)n.probe[y].set(0,0,0);let p=0,g=0,x=0,m=0,u=0,T=0,b=0,S=0,R=0,A=0,P=0;l.sort(vm);for(let y=0,M=l.length;y<M;y++){let C=l[y],z=C.color,W=C.intensity,O=C.distance,X=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=z.r*W,d+=z.g*W,f+=z.b*W;else if(C.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(C.sh.coefficients[q],W);P++}else if(C.isDirectionalLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let ie=C.shadow,Y=t.get(C);Y.shadowIntensity=ie.intensity,Y.shadowBias=ie.bias,Y.shadowNormalBias=ie.normalBias,Y.shadowRadius=ie.radius,Y.shadowMapSize=ie.mapSize,n.directionalShadow[p]=Y,n.directionalShadowMap[p]=X,n.directionalShadowMatrix[p]=C.shadow.matrix,T++}n.directional[p]=q,p++}else if(C.isSpotLight){let q=e.get(C);q.position.setFromMatrixPosition(C.matrixWorld),q.color.copy(z).multiplyScalar(W),q.distance=O,q.coneCos=Math.cos(C.angle),q.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),q.decay=C.decay,n.spot[x]=q;let ie=C.shadow;if(C.map&&(n.spotLightMap[R]=C.map,R++,ie.updateMatrices(C),C.castShadow&&A++),n.spotLightMatrix[x]=ie.matrix,C.castShadow){let Y=t.get(C);Y.shadowIntensity=ie.intensity,Y.shadowBias=ie.bias,Y.shadowNormalBias=ie.normalBias,Y.shadowRadius=ie.radius,Y.shadowMapSize=ie.mapSize,n.spotShadow[x]=Y,n.spotShadowMap[x]=X,S++}x++}else if(C.isRectAreaLight){let q=e.get(C);q.color.copy(z).multiplyScalar(W),q.halfWidth.set(C.width*.5,0,0),q.halfHeight.set(0,C.height*.5,0),n.rectArea[m]=q,m++}else if(C.isPointLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),q.distance=C.distance,q.decay=C.decay,C.castShadow){let ie=C.shadow,Y=t.get(C);Y.shadowIntensity=ie.intensity,Y.shadowBias=ie.bias,Y.shadowNormalBias=ie.normalBias,Y.shadowRadius=ie.radius,Y.shadowMapSize=ie.mapSize,Y.shadowCameraNear=ie.camera.near,Y.shadowCameraFar=ie.camera.far,n.pointShadow[g]=Y,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=C.shadow.matrix,b++}n.point[g]=q,g++}else if(C.isHemisphereLight){let q=e.get(C);q.skyColor.copy(C.color).multiplyScalar(W),q.groundColor.copy(C.groundColor).multiplyScalar(W),n.hemi[u]=q,u++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=he.LTC_FLOAT_1,n.rectAreaLTC2=he.LTC_FLOAT_2):(n.rectAreaLTC1=he.LTC_HALF_1,n.rectAreaLTC2=he.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=f;let U=n.hash;(U.directionalLength!==p||U.pointLength!==g||U.spotLength!==x||U.rectAreaLength!==m||U.hemiLength!==u||U.numDirectionalShadows!==T||U.numPointShadows!==b||U.numSpotShadows!==S||U.numSpotMaps!==R||U.numLightProbes!==P)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=u,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=T,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=S+R-A,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=P,U.directionalLength=p,U.pointLength=g,U.spotLength=x,U.rectAreaLength=m,U.hemiLength=u,U.numDirectionalShadows=T,U.numPointShadows=b,U.numSpotShadows=S,U.numSpotMaps=R,U.numLightProbes=P,n.version=xm++)}function c(l,h){let d=0,f=0,p=0,g=0,x=0,m=h.matrixWorldInverse;for(let u=0,T=l.length;u<T;u++){let b=l[u];if(b.isDirectionalLight){let S=n.directional[d];S.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),d++}else if(b.isSpotLight){let S=n.spot[p];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),p++}else if(b.isRectAreaLight){let S=n.rectArea[g];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(m),a.identity(),r.copy(b.matrixWorld),r.premultiply(m),a.extractRotation(r),S.halfWidth.set(b.width*.5,0,0),S.halfHeight.set(0,b.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),g++}else if(b.isPointLight){let S=n.point[f];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(m),f++}else if(b.isHemisphereLight){let S=n.hemi[x];S.direction.setFromMatrixPosition(b.matrixWorld),S.direction.transformDirection(m),x++}}}return{setup:o,setupView:c,state:n}}function ih(i){let e=new ym(i),t=[],n=[];function s(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function c(h){e.setupView(t,h)}let l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function Mm(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new ih(i),e.set(s,[o])):r>=a.length?(o=new ih(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Sm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,bm=`uniform sampler2D shadow_pass;
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
}`;function Em(i,e,t){let n=new Ui,s=new Le,r=new Le,a=new lt,o=new Ar({depthPacking:Mc}),c=new Rr,l={},h=t.maxTextureSize,d={[Mn]:wt,[wt]:Mn,[qt]:qt},f=new sn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Le},radius:{value:4}},vertexShader:Sm,fragmentShader:bm}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let g=new pt;g.setAttribute("position",new xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Tt(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=To;let u=this.type;this.render=function(A,P,U){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let y=i.getRenderTarget(),M=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),z=i.state;z.setBlending(En),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let W=u!==un&&this.type===un,O=u===un&&this.type!==un;for(let X=0,q=A.length;X<q;X++){let ie=A[X],Y=ie.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",ie,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);let V=Y.getFrameExtents();if(s.multiply(V),r.copy(Y.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/V.x),s.x=r.x*V.x,Y.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/V.y),s.y=r.y*V.y,Y.mapSize.y=r.y)),Y.map===null||W===!0||O===!0){let K=this.type!==un?{minFilter:Gt,magFilter:Gt}:{};Y.map!==null&&Y.map.dispose(),Y.map=new cn(s.x,s.y,K),Y.map.texture.name=ie.name+".shadowMap",Y.camera.updateProjectionMatrix()}i.setRenderTarget(Y.map),i.clear();let Z=Y.getViewportCount();for(let K=0;K<Z;K++){let me=Y.getViewport(K);a.set(r.x*me.x,r.y*me.y,r.x*me.z,r.y*me.w),z.viewport(a),Y.updateMatrices(ie,K),n=Y.getFrustum(),S(P,U,Y.camera,ie,this.type)}Y.isPointLightShadow!==!0&&this.type===un&&T(Y,U),Y.needsUpdate=!1}u=this.type,m.needsUpdate=!1,i.setRenderTarget(y,M,C)};function T(A,P){let U=e.update(x);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new cn(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(P,null,U,f,x,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(P,null,U,p,x,null)}function b(A,P,U,y){let M=null,C=U.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(C!==void 0)M=C;else if(M=U.isPointLight===!0?c:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let z=M.uuid,W=P.uuid,O=l[z];O===void 0&&(O={},l[z]=O);let X=O[W];X===void 0&&(X=M.clone(),O[W]=X,P.addEventListener("dispose",R)),M=X}if(M.visible=P.visible,M.wireframe=P.wireframe,y===un?M.side=P.shadowSide!==null?P.shadowSide:P.side:M.side=P.shadowSide!==null?P.shadowSide:d[P.side],M.alphaMap=P.alphaMap,M.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,M.map=P.map,M.clipShadows=P.clipShadows,M.clippingPlanes=P.clippingPlanes,M.clipIntersection=P.clipIntersection,M.displacementMap=P.displacementMap,M.displacementScale=P.displacementScale,M.displacementBias=P.displacementBias,M.wireframeLinewidth=P.wireframeLinewidth,M.linewidth=P.linewidth,U.isPointLight===!0&&M.isMeshDistanceMaterial===!0){let z=i.properties.get(M);z.light=U}return M}function S(A,P,U,y,M){if(A.visible===!1)return;if(A.layers.test(P.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&M===un)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(U.matrixWorldInverse,A.matrixWorld);let W=e.update(A),O=A.material;if(Array.isArray(O)){let X=W.groups;for(let q=0,ie=X.length;q<ie;q++){let Y=X[q],V=O[Y.materialIndex];if(V&&V.visible){let Z=b(A,V,y,M);A.onBeforeShadow(i,A,P,U,W,Z,Y),i.renderBufferDirect(U,null,W,Z,A,Y),A.onAfterShadow(i,A,P,U,W,Z,Y)}}}else if(O.visible){let X=b(A,O,y,M);A.onBeforeShadow(i,A,P,U,W,X,null),i.renderBufferDirect(U,null,W,X,A,null),A.onAfterShadow(i,A,P,U,W,X,null)}}let z=A.children;for(let W=0,O=z.length;W<O;W++)S(z[W],P,U,y,M)}function R(A){A.target.removeEventListener("dispose",R);for(let U in l){let y=l[U],M=A.target.uuid;M in y&&(y[M].dispose(),delete y[M])}}}var Tm={[zr]:kr,[Vr]:Wr,[Hr]:Xr,[ti]:Gr,[kr]:zr,[Wr]:Vr,[Xr]:Hr,[Gr]:ti};function wm(i,e){function t(){let L=!1,re=new lt,le=null,ve=new lt(0,0,0,0);return{setMask:function(te){le!==te&&!L&&(i.colorMask(te,te,te,te),le=te)},setLocked:function(te){L=te},setClear:function(te,Q,Me,Be,et){et===!0&&(te*=Be,Q*=Be,Me*=Be),re.set(te,Q,Me,Be),ve.equals(re)===!1&&(i.clearColor(te,Q,Me,Be),ve.copy(re))},reset:function(){L=!1,le=null,ve.set(-1,0,0,0)}}}function n(){let L=!1,re=!1,le=null,ve=null,te=null;return{setReversed:function(Q){if(re!==Q){let Me=e.get("EXT_clip_control");Q?Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.ZERO_TO_ONE_EXT):Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.NEGATIVE_ONE_TO_ONE_EXT),re=Q;let Be=te;te=null,this.setClear(Be)}},getReversed:function(){return re},setTest:function(Q){Q?k(i.DEPTH_TEST):j(i.DEPTH_TEST)},setMask:function(Q){le!==Q&&!L&&(i.depthMask(Q),le=Q)},setFunc:function(Q){if(re&&(Q=Tm[Q]),ve!==Q){switch(Q){case zr:i.depthFunc(i.NEVER);break;case kr:i.depthFunc(i.ALWAYS);break;case Vr:i.depthFunc(i.LESS);break;case ti:i.depthFunc(i.LEQUAL);break;case Hr:i.depthFunc(i.EQUAL);break;case Gr:i.depthFunc(i.GEQUAL);break;case Wr:i.depthFunc(i.GREATER);break;case Xr:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ve=Q}},setLocked:function(Q){L=Q},setClear:function(Q){te!==Q&&(re&&(Q=1-Q),i.clearDepth(Q),te=Q)},reset:function(){L=!1,le=null,ve=null,te=null,re=!1}}}function s(){let L=!1,re=null,le=null,ve=null,te=null,Q=null,Me=null,Be=null,et=null;return{setTest:function(Je){L||(Je?k(i.STENCIL_TEST):j(i.STENCIL_TEST))},setMask:function(Je){re!==Je&&!L&&(i.stencilMask(Je),re=Je)},setFunc:function(Je,pn,on){(le!==Je||ve!==pn||te!==on)&&(i.stencilFunc(Je,pn,on),le=Je,ve=pn,te=on)},setOp:function(Je,pn,on){(Q!==Je||Me!==pn||Be!==on)&&(i.stencilOp(Je,pn,on),Q=Je,Me=pn,Be=on)},setLocked:function(Je){L=Je},setClear:function(Je){et!==Je&&(i.clearStencil(Je),et=Je)},reset:function(){L=!1,re=null,le=null,ve=null,te=null,Q=null,Me=null,Be=null,et=null}}}let r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap,h={},d={},f=new WeakMap,p=[],g=null,x=!1,m=null,u=null,T=null,b=null,S=null,R=null,A=null,P=new Ve(0,0,0),U=0,y=!1,M=null,C=null,z=null,W=null,O=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,ie=0,Y=i.getParameter(i.VERSION);Y.indexOf("WebGL")!==-1?(ie=parseFloat(/^WebGL (\d)/.exec(Y)[1]),q=ie>=1):Y.indexOf("OpenGL ES")!==-1&&(ie=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),q=ie>=2);let V=null,Z={},K=i.getParameter(i.SCISSOR_BOX),me=i.getParameter(i.VIEWPORT),Se=new lt().fromArray(K),be=new lt().fromArray(me);function _e(L,re,le,ve){let te=new Uint8Array(4),Q=i.createTexture();i.bindTexture(L,Q),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Me=0;Me<le;Me++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(re,0,i.RGBA,1,1,ve,0,i.RGBA,i.UNSIGNED_BYTE,te):i.texImage2D(re+Me,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,te);return Q}let D={};D[i.TEXTURE_2D]=_e(i.TEXTURE_2D,i.TEXTURE_2D,1),D[i.TEXTURE_CUBE_MAP]=_e(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),D[i.TEXTURE_2D_ARRAY]=_e(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),D[i.TEXTURE_3D]=_e(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),k(i.DEPTH_TEST),a.setFunc(ti),Ce(!1),ce(Eo),k(i.CULL_FACE),We(En);function k(L){h[L]!==!0&&(i.enable(L),h[L]=!0)}function j(L){h[L]!==!1&&(i.disable(L),h[L]=!1)}function pe(L,re){return d[L]!==re?(i.bindFramebuffer(L,re),d[L]=re,L===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=re),L===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=re),!0):!1}function ae(L,re){let le=p,ve=!1;if(L){le=f.get(re),le===void 0&&(le=[],f.set(re,le));let te=L.textures;if(le.length!==te.length||le[0]!==i.COLOR_ATTACHMENT0){for(let Q=0,Me=te.length;Q<Me;Q++)le[Q]=i.COLOR_ATTACHMENT0+Q;le.length=te.length,ve=!0}}else le[0]!==i.BACK&&(le[0]=i.BACK,ve=!0);ve&&i.drawBuffers(le)}function Ne(L){return g!==L?(i.useProgram(L),g=L,!0):!1}let ht={[Fn]:i.FUNC_ADD,[Yl]:i.FUNC_SUBTRACT,[Zl]:i.FUNC_REVERSE_SUBTRACT};ht[Jl]=i.MIN,ht[$l]=i.MAX;let w={[Kl]:i.ZERO,[Ql]:i.ONE,[jl]:i.SRC_COLOR,[rr]:i.SRC_ALPHA,[rc]:i.SRC_ALPHA_SATURATE,[ic]:i.DST_COLOR,[tc]:i.DST_ALPHA,[ec]:i.ONE_MINUS_SRC_COLOR,[ar]:i.ONE_MINUS_SRC_ALPHA,[sc]:i.ONE_MINUS_DST_COLOR,[nc]:i.ONE_MINUS_DST_ALPHA,[ac]:i.CONSTANT_COLOR,[oc]:i.ONE_MINUS_CONSTANT_COLOR,[lc]:i.CONSTANT_ALPHA,[cc]:i.ONE_MINUS_CONSTANT_ALPHA};function We(L,re,le,ve,te,Q,Me,Be,et,Je){if(L===En){x===!0&&(j(i.BLEND),x=!1);return}if(x===!1&&(k(i.BLEND),x=!0),L!==ql){if(L!==m||Je!==y){if((u!==Fn||S!==Fn)&&(i.blendEquation(i.FUNC_ADD),u=Fn,S=Fn),Je)switch(L){case ei:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case wo:i.blendFunc(i.ONE,i.ONE);break;case Ao:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Ro:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case ei:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case wo:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ao:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ro:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}T=null,b=null,R=null,A=null,P.set(0,0,0),U=0,m=L,y=Je}return}te=te||re,Q=Q||le,Me=Me||ve,(re!==u||te!==S)&&(i.blendEquationSeparate(ht[re],ht[te]),u=re,S=te),(le!==T||ve!==b||Q!==R||Me!==A)&&(i.blendFuncSeparate(w[le],w[ve],w[Q],w[Me]),T=le,b=ve,R=Q,A=Me),(Be.equals(P)===!1||et!==U)&&(i.blendColor(Be.r,Be.g,Be.b,et),P.copy(Be),U=et),m=L,y=!1}function Re(L,re){L.side===qt?j(i.CULL_FACE):k(i.CULL_FACE);let le=L.side===wt;re&&(le=!le),Ce(le),L.blending===ei&&L.transparent===!1?We(En):We(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);let ve=L.stencilWrite;o.setTest(ve),ve&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),ge(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?k(i.SAMPLE_ALPHA_TO_COVERAGE):j(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ce(L){M!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),M=L)}function ce(L){L!==Gl?(k(i.CULL_FACE),L!==C&&(L===Eo?i.cullFace(i.BACK):L===Wl?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):j(i.CULL_FACE),C=L}function qe(L){L!==z&&(q&&i.lineWidth(L),z=L)}function ge(L,re,le){L?(k(i.POLYGON_OFFSET_FILL),(W!==re||O!==le)&&(i.polygonOffset(re,le),W=re,O=le)):j(i.POLYGON_OFFSET_FILL)}function Oe(L){L?k(i.SCISSOR_TEST):j(i.SCISSOR_TEST)}function rt(L){L===void 0&&(L=i.TEXTURE0+X-1),V!==L&&(i.activeTexture(L),V=L)}function je(L,re,le){le===void 0&&(V===null?le=i.TEXTURE0+X-1:le=V);let ve=Z[le];ve===void 0&&(ve={type:void 0,texture:void 0},Z[le]=ve),(ve.type!==L||ve.texture!==re)&&(V!==le&&(i.activeTexture(le),V=le),i.bindTexture(L,re||D[L]),ve.type=L,ve.texture=re)}function E(){let L=Z[V];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function _(){try{i.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function B(){try{i.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{i.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ee(){try{i.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function J(){try{i.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ae(){try{i.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function oe(){try{i.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{i.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Te(){try{i.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function se(){try{i.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function fe(L){Se.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),Se.copy(L))}function Ue(L){be.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),be.copy(L))}function we(L,re){let le=l.get(re);le===void 0&&(le=new WeakMap,l.set(re,le));let ve=le.get(L);ve===void 0&&(ve=i.getUniformBlockIndex(re,L.name),le.set(L,ve))}function ue(L,re){let ve=l.get(re).get(L);c.get(re)!==ve&&(i.uniformBlockBinding(re,ve,L.__bindingPointIndex),c.set(re,ve))}function ke(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},V=null,Z={},d={},f=new WeakMap,p=[],g=null,x=!1,m=null,u=null,T=null,b=null,S=null,R=null,A=null,P=new Ve(0,0,0),U=0,y=!1,M=null,C=null,z=null,W=null,O=null,Se.set(0,0,i.canvas.width,i.canvas.height),be.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:k,disable:j,bindFramebuffer:pe,drawBuffers:ae,useProgram:Ne,setBlending:We,setMaterial:Re,setFlipSided:Ce,setCullFace:ce,setLineWidth:qe,setPolygonOffset:ge,setScissorTest:Oe,activeTexture:rt,bindTexture:je,unbindTexture:E,compressedTexImage2D:_,compressedTexImage3D:B,texImage2D:Te,texImage3D:se,updateUBOMapping:we,uniformBlockBinding:ue,texStorage2D:oe,texStorage3D:Ee,texSubImage2D:$,texSubImage3D:ee,compressedTexSubImage2D:J,compressedTexSubImage3D:Ae,scissor:fe,viewport:Ue,reset:ke}}function Am(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Le,h=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,_){return p?new OffscreenCanvas(E,_):ns("canvas")}function x(E,_,B){let $=1,ee=je(E);if((ee.width>B||ee.height>B)&&($=B/Math.max(ee.width,ee.height)),$<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let J=Math.floor($*ee.width),Ae=Math.floor($*ee.height);d===void 0&&(d=g(J,Ae));let oe=_?g(J,Ae):d;return oe.width=J,oe.height=Ae,oe.getContext("2d").drawImage(E,0,0,J,Ae),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+J+"x"+Ae+")."),oe}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),E;return E}function m(E){return E.generateMipmaps}function u(E){i.generateMipmap(E)}function T(E){return E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?i.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(E,_,B,$,ee=!1){if(E!==null){if(i[E]!==void 0)return i[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let J=_;if(_===i.RED&&(B===i.FLOAT&&(J=i.R32F),B===i.HALF_FLOAT&&(J=i.R16F),B===i.UNSIGNED_BYTE&&(J=i.R8)),_===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.R8UI),B===i.UNSIGNED_SHORT&&(J=i.R16UI),B===i.UNSIGNED_INT&&(J=i.R32UI),B===i.BYTE&&(J=i.R8I),B===i.SHORT&&(J=i.R16I),B===i.INT&&(J=i.R32I)),_===i.RG&&(B===i.FLOAT&&(J=i.RG32F),B===i.HALF_FLOAT&&(J=i.RG16F),B===i.UNSIGNED_BYTE&&(J=i.RG8)),_===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RG8UI),B===i.UNSIGNED_SHORT&&(J=i.RG16UI),B===i.UNSIGNED_INT&&(J=i.RG32UI),B===i.BYTE&&(J=i.RG8I),B===i.SHORT&&(J=i.RG16I),B===i.INT&&(J=i.RG32I)),_===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGB8UI),B===i.UNSIGNED_SHORT&&(J=i.RGB16UI),B===i.UNSIGNED_INT&&(J=i.RGB32UI),B===i.BYTE&&(J=i.RGB8I),B===i.SHORT&&(J=i.RGB16I),B===i.INT&&(J=i.RGB32I)),_===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),B===i.UNSIGNED_INT&&(J=i.RGBA32UI),B===i.BYTE&&(J=i.RGBA8I),B===i.SHORT&&(J=i.RGBA16I),B===i.INT&&(J=i.RGBA32I)),_===i.RGB&&(B===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),_===i.RGBA){let Ae=ee?es:Ye.getTransfer($);B===i.FLOAT&&(J=i.RGBA32F),B===i.HALF_FLOAT&&(J=i.RGBA16F),B===i.UNSIGNED_BYTE&&(J=Ae===$e?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function S(E,_){let B;return E?_===null||_===Xn||_===Bi?B=i.DEPTH24_STENCIL8:_===dn?B=i.DEPTH32F_STENCIL8:_===Fi&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Xn||_===Bi?B=i.DEPTH_COMPONENT24:_===dn?B=i.DEPTH_COMPONENT32F:_===Fi&&(B=i.DEPTH_COMPONENT16),B}function R(E,_){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==Gt&&E.minFilter!==en?Math.log2(Math.max(_.width,_.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?_.mipmaps.length:1}function A(E){let _=E.target;_.removeEventListener("dispose",A),U(_),_.isVideoTexture&&h.delete(_)}function P(E){let _=E.target;_.removeEventListener("dispose",P),M(_)}function U(E){let _=n.get(E);if(_.__webglInit===void 0)return;let B=E.source,$=f.get(B);if($){let ee=$[_.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&y(E),Object.keys($).length===0&&f.delete(B)}n.remove(E)}function y(E){let _=n.get(E);i.deleteTexture(_.__webglTexture);let B=E.source,$=f.get(B);delete $[_.__cacheKey],a.memory.textures--}function M(E){let _=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(_.__webglFramebuffer[$]))for(let ee=0;ee<_.__webglFramebuffer[$].length;ee++)i.deleteFramebuffer(_.__webglFramebuffer[$][ee]);else i.deleteFramebuffer(_.__webglFramebuffer[$]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[$])}else{if(Array.isArray(_.__webglFramebuffer))for(let $=0;$<_.__webglFramebuffer.length;$++)i.deleteFramebuffer(_.__webglFramebuffer[$]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let $=0;$<_.__webglColorRenderbuffer.length;$++)_.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[$]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=E.textures;for(let $=0,ee=B.length;$<ee;$++){let J=n.get(B[$]);J.__webglTexture&&(i.deleteTexture(J.__webglTexture),a.memory.textures--),n.remove(B[$])}n.remove(E)}let C=0;function z(){C=0}function W(){let E=C;return E>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+s.maxTextures),C+=1,E}function O(E){let _=[];return _.push(E.wrapS),_.push(E.wrapT),_.push(E.wrapR||0),_.push(E.magFilter),_.push(E.minFilter),_.push(E.anisotropy),_.push(E.internalFormat),_.push(E.format),_.push(E.type),_.push(E.generateMipmaps),_.push(E.premultiplyAlpha),_.push(E.flipY),_.push(E.unpackAlignment),_.push(E.colorSpace),_.join()}function X(E,_){let B=n.get(E);if(E.isVideoTexture&&Oe(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&B.__version!==E.version){let $=E.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{D(B,E,_);return}}else E.isExternalTexture&&(B.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+_)}function q(E,_){let B=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&B.__version!==E.version){D(B,E,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+_)}function ie(E,_){let B=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&B.__version!==E.version){D(B,E,_);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+_)}function Y(E,_){let B=n.get(E);if(E.version>0&&B.__version!==E.version){k(B,E,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+_)}let V={[or]:i.REPEAT,[Nn]:i.CLAMP_TO_EDGE,[lr]:i.MIRRORED_REPEAT},Z={[Gt]:i.NEAREST,[vc]:i.NEAREST_MIPMAP_NEAREST,[Ss]:i.NEAREST_MIPMAP_LINEAR,[en]:i.LINEAR,[Jr]:i.LINEAR_MIPMAP_NEAREST,[Wn]:i.LINEAR_MIPMAP_LINEAR},K={[bc]:i.NEVER,[Cc]:i.ALWAYS,[Ec]:i.LESS,[zo]:i.LEQUAL,[Tc]:i.EQUAL,[Rc]:i.GEQUAL,[wc]:i.GREATER,[Ac]:i.NOTEQUAL};function me(E,_){if(_.type===dn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===en||_.magFilter===Jr||_.magFilter===Ss||_.magFilter===Wn||_.minFilter===en||_.minFilter===Jr||_.minFilter===Ss||_.minFilter===Wn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(E,i.TEXTURE_WRAP_S,V[_.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,V[_.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,V[_.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,Z[_.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,Z[_.minFilter]),_.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,K[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Gt||_.minFilter!==Ss&&_.minFilter!==Wn||_.type===dn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(E,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Se(E,_){let B=!1;E.__webglInit===void 0&&(E.__webglInit=!0,_.addEventListener("dispose",A));let $=_.source,ee=f.get($);ee===void 0&&(ee={},f.set($,ee));let J=O(_);if(J!==E.__cacheKey){ee[J]===void 0&&(ee[J]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),ee[J].usedTimes++;let Ae=ee[E.__cacheKey];Ae!==void 0&&(ee[E.__cacheKey].usedTimes--,Ae.usedTimes===0&&y(_)),E.__cacheKey=J,E.__webglTexture=ee[J].texture}return B}function be(E,_,B){return Math.floor(Math.floor(E/B)/_)}function _e(E,_,B,$){let J=E.updateRanges;if(J.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,_.width,_.height,B,$,_.data);else{J.sort((se,fe)=>se.start-fe.start);let Ae=0;for(let se=1;se<J.length;se++){let fe=J[Ae],Ue=J[se],we=fe.start+fe.count,ue=be(Ue.start,_.width,4),ke=be(fe.start,_.width,4);Ue.start<=we+1&&ue===ke&&be(Ue.start+Ue.count-1,_.width,4)===ue?fe.count=Math.max(fe.count,Ue.start+Ue.count-fe.start):(++Ae,J[Ae]=Ue)}J.length=Ae+1;let oe=i.getParameter(i.UNPACK_ROW_LENGTH),Ee=i.getParameter(i.UNPACK_SKIP_PIXELS),Te=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,_.width);for(let se=0,fe=J.length;se<fe;se++){let Ue=J[se],we=Math.floor(Ue.start/4),ue=Math.ceil(Ue.count/4),ke=we%_.width,L=Math.floor(we/_.width),re=ue,le=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,ke),i.pixelStorei(i.UNPACK_SKIP_ROWS,L),t.texSubImage2D(i.TEXTURE_2D,0,ke,L,re,le,B,$,_.data)}E.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,oe),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Ee),i.pixelStorei(i.UNPACK_SKIP_ROWS,Te)}}function D(E,_,B){let $=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&($=i.TEXTURE_3D);let ee=Se(E,_),J=_.source;t.bindTexture($,E.__webglTexture,i.TEXTURE0+B);let Ae=n.get(J);if(J.version!==Ae.__version||ee===!0){t.activeTexture(i.TEXTURE0+B);let oe=Ye.getPrimaries(Ye.workingColorSpace),Ee=_.colorSpace===wn?null:Ye.getPrimaries(_.colorSpace),Te=_.colorSpace===wn||oe===Ee?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let se=x(_.image,!1,s.maxTextureSize);se=rt(_,se);let fe=r.convert(_.format,_.colorSpace),Ue=r.convert(_.type),we=b(_.internalFormat,fe,Ue,_.colorSpace,_.isVideoTexture);me($,_);let ue,ke=_.mipmaps,L=_.isVideoTexture!==!0,re=Ae.__version===void 0||ee===!0,le=J.dataReady,ve=R(_,se);if(_.isDepthTexture)we=S(_.format===zi,_.type),re&&(L?t.texStorage2D(i.TEXTURE_2D,1,we,se.width,se.height):t.texImage2D(i.TEXTURE_2D,0,we,se.width,se.height,0,fe,Ue,null));else if(_.isDataTexture)if(ke.length>0){L&&re&&t.texStorage2D(i.TEXTURE_2D,ve,we,ke[0].width,ke[0].height);for(let te=0,Q=ke.length;te<Q;te++)ue=ke[te],L?le&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,fe,Ue,ue.data):t.texImage2D(i.TEXTURE_2D,te,we,ue.width,ue.height,0,fe,Ue,ue.data);_.generateMipmaps=!1}else L?(re&&t.texStorage2D(i.TEXTURE_2D,ve,we,se.width,se.height),le&&_e(_,se,fe,Ue)):t.texImage2D(i.TEXTURE_2D,0,we,se.width,se.height,0,fe,Ue,se.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){L&&re&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ve,we,ke[0].width,ke[0].height,se.depth);for(let te=0,Q=ke.length;te<Q;te++)if(ue=ke[te],_.format!==Yt)if(fe!==null)if(L){if(le)if(_.layerUpdates.size>0){let Me=qo(ue.width,ue.height,_.format,_.type);for(let Be of _.layerUpdates){let et=ue.data.subarray(Be*Me/ue.data.BYTES_PER_ELEMENT,(Be+1)*Me/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,Be,ue.width,ue.height,1,fe,et)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,ue.width,ue.height,se.depth,fe,ue.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,te,we,ue.width,ue.height,se.depth,0,ue.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?le&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,te,0,0,0,ue.width,ue.height,se.depth,fe,Ue,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,te,we,ue.width,ue.height,se.depth,0,fe,Ue,ue.data)}else{L&&re&&t.texStorage2D(i.TEXTURE_2D,ve,we,ke[0].width,ke[0].height);for(let te=0,Q=ke.length;te<Q;te++)ue=ke[te],_.format!==Yt?fe!==null?L?le&&t.compressedTexSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,fe,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,te,we,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?le&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,ue.width,ue.height,fe,Ue,ue.data):t.texImage2D(i.TEXTURE_2D,te,we,ue.width,ue.height,0,fe,Ue,ue.data)}else if(_.isDataArrayTexture)if(L){if(re&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ve,we,se.width,se.height,se.depth),le)if(_.layerUpdates.size>0){let te=qo(se.width,se.height,_.format,_.type);for(let Q of _.layerUpdates){let Me=se.data.subarray(Q*te/se.data.BYTES_PER_ELEMENT,(Q+1)*te/se.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Q,se.width,se.height,1,fe,Ue,Me)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,fe,Ue,se.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,we,se.width,se.height,se.depth,0,fe,Ue,se.data);else if(_.isData3DTexture)L?(re&&t.texStorage3D(i.TEXTURE_3D,ve,we,se.width,se.height,se.depth),le&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,fe,Ue,se.data)):t.texImage3D(i.TEXTURE_3D,0,we,se.width,se.height,se.depth,0,fe,Ue,se.data);else if(_.isFramebufferTexture){if(re)if(L)t.texStorage2D(i.TEXTURE_2D,ve,we,se.width,se.height);else{let te=se.width,Q=se.height;for(let Me=0;Me<ve;Me++)t.texImage2D(i.TEXTURE_2D,Me,we,te,Q,0,fe,Ue,null),te>>=1,Q>>=1}}else if(ke.length>0){if(L&&re){let te=je(ke[0]);t.texStorage2D(i.TEXTURE_2D,ve,we,te.width,te.height)}for(let te=0,Q=ke.length;te<Q;te++)ue=ke[te],L?le&&t.texSubImage2D(i.TEXTURE_2D,te,0,0,fe,Ue,ue):t.texImage2D(i.TEXTURE_2D,te,we,fe,Ue,ue);_.generateMipmaps=!1}else if(L){if(re){let te=je(se);t.texStorage2D(i.TEXTURE_2D,ve,we,te.width,te.height)}le&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,Ue,se)}else t.texImage2D(i.TEXTURE_2D,0,we,fe,Ue,se);m(_)&&u($),Ae.__version=J.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function k(E,_,B){if(_.image.length!==6)return;let $=Se(E,_),ee=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+B);let J=n.get(ee);if(ee.version!==J.__version||$===!0){t.activeTexture(i.TEXTURE0+B);let Ae=Ye.getPrimaries(Ye.workingColorSpace),oe=_.colorSpace===wn?null:Ye.getPrimaries(_.colorSpace),Ee=_.colorSpace===wn||Ae===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);let Te=_.isCompressedTexture||_.image[0].isCompressedTexture,se=_.image[0]&&_.image[0].isDataTexture,fe=[];for(let Q=0;Q<6;Q++)!Te&&!se?fe[Q]=x(_.image[Q],!0,s.maxCubemapSize):fe[Q]=se?_.image[Q].image:_.image[Q],fe[Q]=rt(_,fe[Q]);let Ue=fe[0],we=r.convert(_.format,_.colorSpace),ue=r.convert(_.type),ke=b(_.internalFormat,we,ue,_.colorSpace),L=_.isVideoTexture!==!0,re=J.__version===void 0||$===!0,le=ee.dataReady,ve=R(_,Ue);me(i.TEXTURE_CUBE_MAP,_);let te;if(Te){L&&re&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ve,ke,Ue.width,Ue.height);for(let Q=0;Q<6;Q++){te=fe[Q].mipmaps;for(let Me=0;Me<te.length;Me++){let Be=te[Me];_.format!==Yt?we!==null?L?le&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,0,0,Be.width,Be.height,we,Be.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,ke,Be.width,Be.height,0,Be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,0,0,Be.width,Be.height,we,ue,Be.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,ke,Be.width,Be.height,0,we,ue,Be.data)}}}else{if(te=_.mipmaps,L&&re){te.length>0&&ve++;let Q=je(fe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ve,ke,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(se){L?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,fe[Q].width,fe[Q].height,we,ue,fe[Q].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,ke,fe[Q].width,fe[Q].height,0,we,ue,fe[Q].data);for(let Me=0;Me<te.length;Me++){let et=te[Me].image[Q].image;L?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,0,0,et.width,et.height,we,ue,et.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,ke,et.width,et.height,0,we,ue,et.data)}}else{L?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,we,ue,fe[Q]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,ke,we,ue,fe[Q]);for(let Me=0;Me<te.length;Me++){let Be=te[Me];L?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,0,0,we,ue,Be.image[Q]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,ke,we,ue,Be.image[Q])}}}m(_)&&u(i.TEXTURE_CUBE_MAP),J.__version=ee.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function j(E,_,B,$,ee,J){let Ae=r.convert(B.format,B.colorSpace),oe=r.convert(B.type),Ee=b(B.internalFormat,Ae,oe,B.colorSpace),Te=n.get(_),se=n.get(B);if(se.__renderTarget=_,!Te.__hasExternalTextures){let fe=Math.max(1,_.width>>J),Ue=Math.max(1,_.height>>J);ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?t.texImage3D(ee,J,Ee,fe,Ue,_.depth,0,Ae,oe,null):t.texImage2D(ee,J,Ee,fe,Ue,0,Ae,oe,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),ge(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,ee,se.__webglTexture,0,qe(_)):(ee===i.TEXTURE_2D||ee>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,ee,se.__webglTexture,J),t.bindFramebuffer(i.FRAMEBUFFER,null)}function pe(E,_,B){if(i.bindRenderbuffer(i.RENDERBUFFER,E),_.depthBuffer){let $=_.depthTexture,ee=$&&$.isDepthTexture?$.type:null,J=S(_.stencilBuffer,ee),Ae=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=qe(_);ge(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,oe,J,_.width,_.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,oe,J,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,J,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ae,i.RENDERBUFFER,E)}else{let $=_.textures;for(let ee=0;ee<$.length;ee++){let J=$[ee],Ae=r.convert(J.format,J.colorSpace),oe=r.convert(J.type),Ee=b(J.internalFormat,Ae,oe,J.colorSpace),Te=qe(_);B&&ge(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Te,Ee,_.width,_.height):ge(_)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Te,Ee,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Ee,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ae(E,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let $=n.get(_.depthTexture);$.__renderTarget=_,(!$.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),X(_.depthTexture,0);let ee=$.__webglTexture,J=qe(_);if(_.depthTexture.format===Ii)ge(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ee,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ee,0);else if(_.depthTexture.format===zi)ge(_)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ee,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function Ne(E){let _=n.get(E),B=E.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==E.depthTexture){let $=E.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),$){let ee=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,$.removeEventListener("dispose",ee)};$.addEventListener("dispose",ee),_.__depthDisposeCallback=ee}_.__boundDepthTexture=$}if(E.depthTexture&&!_.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");let $=E.texture.mipmaps;$&&$.length>0?ae(_.__webglFramebuffer[0],E):ae(_.__webglFramebuffer,E)}else if(B){_.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[$]),_.__webglDepthbuffer[$]===void 0)_.__webglDepthbuffer[$]=i.createRenderbuffer(),pe(_.__webglDepthbuffer[$],E,!1);else{let ee=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=_.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,J),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,J)}}else{let $=E.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),pe(_.__webglDepthbuffer,E,!1);else{let ee=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,J=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,J),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,J)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ht(E,_,B){let $=n.get(E);_!==void 0&&j($.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Ne(E)}function w(E){let _=E.texture,B=n.get(E),$=n.get(_);E.addEventListener("dispose",P);let ee=E.textures,J=E.isWebGLCubeRenderTarget===!0,Ae=ee.length>1;if(Ae||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=_.version,a.memory.textures++),J){B.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[oe]=[];for(let Ee=0;Ee<_.mipmaps.length;Ee++)B.__webglFramebuffer[oe][Ee]=i.createFramebuffer()}else B.__webglFramebuffer[oe]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let oe=0;oe<_.mipmaps.length;oe++)B.__webglFramebuffer[oe]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(Ae)for(let oe=0,Ee=ee.length;oe<Ee;oe++){let Te=n.get(ee[oe]);Te.__webglTexture===void 0&&(Te.__webglTexture=i.createTexture(),a.memory.textures++)}if(E.samples>0&&ge(E)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let oe=0;oe<ee.length;oe++){let Ee=ee[oe];B.__webglColorRenderbuffer[oe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[oe]);let Te=r.convert(Ee.format,Ee.colorSpace),se=r.convert(Ee.type),fe=b(Ee.internalFormat,Te,se,Ee.colorSpace,E.isXRRenderTarget===!0),Ue=qe(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ue,fe,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+oe,i.RENDERBUFFER,B.__webglColorRenderbuffer[oe])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),pe(B.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(J){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),me(i.TEXTURE_CUBE_MAP,_);for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0)for(let Ee=0;Ee<_.mipmaps.length;Ee++)j(B.__webglFramebuffer[oe][Ee],E,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Ee);else j(B.__webglFramebuffer[oe],E,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);m(_)&&u(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ae){for(let oe=0,Ee=ee.length;oe<Ee;oe++){let Te=ee[oe],se=n.get(Te),fe=i.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(fe=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,se.__webglTexture),me(fe,Te),j(B.__webglFramebuffer,E,Te,i.COLOR_ATTACHMENT0+oe,fe,0),m(Te)&&u(fe)}t.unbindTexture()}else{let oe=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(oe=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(oe,$.__webglTexture),me(oe,_),_.mipmaps&&_.mipmaps.length>0)for(let Ee=0;Ee<_.mipmaps.length;Ee++)j(B.__webglFramebuffer[Ee],E,_,i.COLOR_ATTACHMENT0,oe,Ee);else j(B.__webglFramebuffer,E,_,i.COLOR_ATTACHMENT0,oe,0);m(_)&&u(oe),t.unbindTexture()}E.depthBuffer&&Ne(E)}function We(E){let _=E.textures;for(let B=0,$=_.length;B<$;B++){let ee=_[B];if(m(ee)){let J=T(E),Ae=n.get(ee).__webglTexture;t.bindTexture(J,Ae),u(J),t.unbindTexture()}}}let Re=[],Ce=[];function ce(E){if(E.samples>0){if(ge(E)===!1){let _=E.textures,B=E.width,$=E.height,ee=i.COLOR_BUFFER_BIT,J=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ae=n.get(E),oe=_.length>1;if(oe)for(let Te=0;Te<_.length;Te++)t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer);let Ee=E.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer);for(let Te=0;Te<_.length;Te++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(ee|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(ee|=i.STENCIL_BUFFER_BIT)),oe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ae.__webglColorRenderbuffer[Te]);let se=n.get(_[Te]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,se,0)}i.blitFramebuffer(0,0,B,$,0,0,B,$,ee,i.NEAREST),c===!0&&(Re.length=0,Ce.length=0,Re.push(i.COLOR_ATTACHMENT0+Te),E.depthBuffer&&E.resolveDepthBuffer===!1&&(Re.push(J),Ce.push(J),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ce)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Re))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),oe)for(let Te=0;Te<_.length;Te++){t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.RENDERBUFFER,Ae.__webglColorRenderbuffer[Te]);let se=n.get(_[Te]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Te,i.TEXTURE_2D,se,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&c){let _=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function qe(E){return Math.min(s.maxSamples,E.samples)}function ge(E){let _=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Oe(E){let _=a.render.frame;h.get(E)!==_&&(h.set(E,_),E.update())}function rt(E,_){let B=E.colorSpace,$=E.format,ee=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||B!==ni&&B!==wn&&(Ye.getTransfer(B)===$e?($!==Yt||ee!==rn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),_}function je(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(l.width=E.naturalWidth||E.width,l.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(l.width=E.displayWidth,l.height=E.displayHeight):(l.width=E.width,l.height=E.height),l}this.allocateTextureUnit=W,this.resetTextureUnits=z,this.setTexture2D=X,this.setTexture2DArray=q,this.setTexture3D=ie,this.setTextureCube=Y,this.rebindTextures=ht,this.setupRenderTarget=w,this.updateRenderTargetMipmap=We,this.updateMultisampleRenderTarget=ce,this.setupDepthRenderbuffer=Ne,this.setupFrameBufferTexture=j,this.useMultisampledRTT=ge}function Rm(i,e){function t(n,s=wn){let r,a=Ye.getTransfer(s);if(n===rn)return i.UNSIGNED_BYTE;if(n===Kr)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Qr)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Lo)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Do)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Io)return i.BYTE;if(n===Po)return i.SHORT;if(n===Fi)return i.UNSIGNED_SHORT;if(n===$r)return i.INT;if(n===Xn)return i.UNSIGNED_INT;if(n===dn)return i.FLOAT;if(n===Oi)return i.HALF_FLOAT;if(n===Uo)return i.ALPHA;if(n===No)return i.RGB;if(n===Yt)return i.RGBA;if(n===Ii)return i.DEPTH_COMPONENT;if(n===zi)return i.DEPTH_STENCIL;if(n===Fo)return i.RED;if(n===jr)return i.RED_INTEGER;if(n===Oo)return i.RG;if(n===ea)return i.RG_INTEGER;if(n===ta)return i.RGBA_INTEGER;if(n===bs||n===Es||n===Ts||n===ws)if(a===$e)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===bs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Es)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ts)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ws)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===bs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Es)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ts)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ws)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===na||n===ia||n===sa||n===ra)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===na)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ia)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===sa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ra)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===aa||n===oa||n===la)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===aa||n===oa)return a===$e?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===la)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ca||n===ha||n===ua||n===da||n===fa||n===pa||n===ma||n===ga||n===_a||n===xa||n===va||n===ya||n===Ma||n===Sa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ca)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ha)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ua)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===da)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===fa)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===pa)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ma)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ga)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===_a)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===xa)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===va)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ya)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ma)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Sa)return a===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ba||n===Ea||n===Ta)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ba)return a===$e?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ea)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ta)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===wa||n===Aa||n===Ra||n===Ca)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===wa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Aa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ra)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ca)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Bi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Cm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Im=`
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

}`,rl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ds(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new sn({vertexShader:Cm,fragmentShader:Im,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Tt(new ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},al=class extends Sn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,d=null,f=null,p=null,g=null,x=typeof XRWebGLBinding<"u",m=new rl,u={},T=t.getContextAttributes(),b=null,S=null,R=[],A=[],P=new Le,U=null,y=new It;y.viewport=new lt;let M=new It;M.viewport=new lt;let C=[y,M],z=new Br,W=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(D){let k=R[D];return k===void 0&&(k=new Di,R[D]=k),k.getTargetRaySpace()},this.getControllerGrip=function(D){let k=R[D];return k===void 0&&(k=new Di,R[D]=k),k.getGripSpace()},this.getHand=function(D){let k=R[D];return k===void 0&&(k=new Di,R[D]=k),k.getHandSpace()};function X(D){let k=A.indexOf(D.inputSource);if(k===-1)return;let j=R[k];j!==void 0&&(j.update(D.inputSource,D.frame,l||a),j.dispatchEvent({type:D.type,data:D.inputSource}))}function q(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",ie);for(let D=0;D<R.length;D++){let k=A[D];k!==null&&(A[D]=null,R[D].disconnect(k))}W=null,O=null,m.reset();for(let D in u)delete u[D];e.setRenderTarget(b),p=null,f=null,d=null,s=null,S=null,_e.stop(),n.isPresenting=!1,e.setPixelRatio(U),e.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(D){r=D,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(D){o=D,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(D){l=D},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return d===null&&x&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(D){if(s=D,s!==null){if(b=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",q),s.addEventListener("inputsourceschange",ie),T.xrCompatible!==!0&&await t.makeXRCompatible(),U=e.getPixelRatio(),e.getSize(P),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let j=null,pe=null,ae=null;T.depth&&(ae=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,j=T.stencil?zi:Ii,pe=T.stencil?Bi:Xn);let Ne={colorFormat:t.RGBA8,depthFormat:ae,scaleFactor:r};d=this.getBinding(),f=d.createProjectionLayer(Ne),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new cn(f.textureWidth,f.textureHeight,{format:Yt,type:rn,depthTexture:new us(f.textureWidth,f.textureHeight,pe,void 0,void 0,void 0,void 0,void 0,void 0,j),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let j={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,j),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new cn(p.framebufferWidth,p.framebufferHeight,{format:Yt,type:rn,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),_e.setContext(s),_e.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ie(D){for(let k=0;k<D.removed.length;k++){let j=D.removed[k],pe=A.indexOf(j);pe>=0&&(A[pe]=null,R[pe].disconnect(j))}for(let k=0;k<D.added.length;k++){let j=D.added[k],pe=A.indexOf(j);if(pe===-1){for(let Ne=0;Ne<R.length;Ne++)if(Ne>=A.length){A.push(j),pe=Ne;break}else if(A[Ne]===null){A[Ne]=j,pe=Ne;break}if(pe===-1)break}let ae=R[pe];ae&&ae.connect(j)}}let Y=new I,V=new I;function Z(D,k,j){Y.setFromMatrixPosition(k.matrixWorld),V.setFromMatrixPosition(j.matrixWorld);let pe=Y.distanceTo(V),ae=k.projectionMatrix.elements,Ne=j.projectionMatrix.elements,ht=ae[14]/(ae[10]-1),w=ae[14]/(ae[10]+1),We=(ae[9]+1)/ae[5],Re=(ae[9]-1)/ae[5],Ce=(ae[8]-1)/ae[0],ce=(Ne[8]+1)/Ne[0],qe=ht*Ce,ge=ht*ce,Oe=pe/(-Ce+ce),rt=Oe*-Ce;if(k.matrixWorld.decompose(D.position,D.quaternion,D.scale),D.translateX(rt),D.translateZ(Oe),D.matrixWorld.compose(D.position,D.quaternion,D.scale),D.matrixWorldInverse.copy(D.matrixWorld).invert(),ae[10]===-1)D.projectionMatrix.copy(k.projectionMatrix),D.projectionMatrixInverse.copy(k.projectionMatrixInverse);else{let je=ht+Oe,E=w+Oe,_=qe-rt,B=ge+(pe-rt),$=We*w/E*je,ee=Re*w/E*je;D.projectionMatrix.makePerspective(_,B,$,ee,je,E),D.projectionMatrixInverse.copy(D.projectionMatrix).invert()}}function K(D,k){k===null?D.matrixWorld.copy(D.matrix):D.matrixWorld.multiplyMatrices(k.matrixWorld,D.matrix),D.matrixWorldInverse.copy(D.matrixWorld).invert()}this.updateCamera=function(D){if(s===null)return;let k=D.near,j=D.far;m.texture!==null&&(m.depthNear>0&&(k=m.depthNear),m.depthFar>0&&(j=m.depthFar)),z.near=M.near=y.near=k,z.far=M.far=y.far=j,(W!==z.near||O!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),W=z.near,O=z.far),z.layers.mask=D.layers.mask|6,y.layers.mask=z.layers.mask&3,M.layers.mask=z.layers.mask&5;let pe=D.parent,ae=z.cameras;K(z,pe);for(let Ne=0;Ne<ae.length;Ne++)K(ae[Ne],pe);ae.length===2?Z(z,y,M):z.projectionMatrix.copy(y.projectionMatrix),me(D,z,pe)};function me(D,k,j){j===null?D.matrix.copy(k.matrixWorld):(D.matrix.copy(j.matrixWorld),D.matrix.invert(),D.matrix.multiply(k.matrixWorld)),D.matrix.decompose(D.position,D.quaternion,D.scale),D.updateMatrixWorld(!0),D.projectionMatrix.copy(k.projectionMatrix),D.projectionMatrixInverse.copy(k.projectionMatrixInverse),D.isPerspectiveCamera&&(D.fov=hr*2*Math.atan(1/D.projectionMatrix.elements[5]),D.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(D){c=D,f!==null&&(f.fixedFoveation=D),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=D)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function(D){return u[D]};let Se=null;function be(D,k){if(h=k.getViewerPose(l||a),g=k,h!==null){let j=h.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let pe=!1;j.length!==z.cameras.length&&(z.cameras.length=0,pe=!0);for(let w=0;w<j.length;w++){let We=j[w],Re=null;if(p!==null)Re=p.getViewport(We);else{let ce=d.getViewSubImage(f,We);Re=ce.viewport,w===0&&(e.setRenderTargetTextures(S,ce.colorTexture,ce.depthStencilTexture),e.setRenderTarget(S))}let Ce=C[w];Ce===void 0&&(Ce=new It,Ce.layers.enable(w),Ce.viewport=new lt,C[w]=Ce),Ce.matrix.fromArray(We.transform.matrix),Ce.matrix.decompose(Ce.position,Ce.quaternion,Ce.scale),Ce.projectionMatrix.fromArray(We.projectionMatrix),Ce.projectionMatrixInverse.copy(Ce.projectionMatrix).invert(),Ce.viewport.set(Re.x,Re.y,Re.width,Re.height),w===0&&(z.matrix.copy(Ce.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),pe===!0&&z.cameras.push(Ce)}let ae=s.enabledFeatures;if(ae&&ae.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){d=n.getBinding();let w=d.getDepthInformation(j[0]);w&&w.isValid&&w.texture&&m.init(w,s.renderState)}if(ae&&ae.includes("camera-access")&&x){e.state.unbindTexture(),d=n.getBinding();for(let w=0;w<j.length;w++){let We=j[w].camera;if(We){let Re=u[We];Re||(Re=new ds,u[We]=Re);let Ce=d.getCameraImage(We);Re.sourceTexture=Ce}}}}for(let j=0;j<R.length;j++){let pe=A[j],ae=R[j];pe!==null&&ae!==void 0&&ae.update(pe,k,l||a)}Se&&Se(D,k),k.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:k}),g=null}let _e=new sh;_e.setAnimationLoop(be),this.setAnimationLoop=function(D){Se=D},this.dispose=function(){}}},fi=new nn,Pm=new it;function Lm(i,e){function t(m,u){m.matrixAutoUpdate===!0&&m.updateMatrix(),u.value.copy(m.matrix)}function n(m,u){u.color.getRGB(m.fogColor.value,Ho(i)),u.isFog?(m.fogNear.value=u.near,m.fogFar.value=u.far):u.isFogExp2&&(m.fogDensity.value=u.density)}function s(m,u,T,b,S){u.isMeshBasicMaterial||u.isMeshLambertMaterial?r(m,u):u.isMeshToonMaterial?(r(m,u),d(m,u)):u.isMeshPhongMaterial?(r(m,u),h(m,u)):u.isMeshStandardMaterial?(r(m,u),f(m,u),u.isMeshPhysicalMaterial&&p(m,u,S)):u.isMeshMatcapMaterial?(r(m,u),g(m,u)):u.isMeshDepthMaterial?r(m,u):u.isMeshDistanceMaterial?(r(m,u),x(m,u)):u.isMeshNormalMaterial?r(m,u):u.isLineBasicMaterial?(a(m,u),u.isLineDashedMaterial&&o(m,u)):u.isPointsMaterial?c(m,u,T,b):u.isSpriteMaterial?l(m,u):u.isShadowMaterial?(m.color.value.copy(u.color),m.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function r(m,u){m.opacity.value=u.opacity,u.color&&m.diffuse.value.copy(u.color),u.emissive&&m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.bumpMap&&(m.bumpMap.value=u.bumpMap,t(u.bumpMap,m.bumpMapTransform),m.bumpScale.value=u.bumpScale,u.side===wt&&(m.bumpScale.value*=-1)),u.normalMap&&(m.normalMap.value=u.normalMap,t(u.normalMap,m.normalMapTransform),m.normalScale.value.copy(u.normalScale),u.side===wt&&m.normalScale.value.negate()),u.displacementMap&&(m.displacementMap.value=u.displacementMap,t(u.displacementMap,m.displacementMapTransform),m.displacementScale.value=u.displacementScale,m.displacementBias.value=u.displacementBias),u.emissiveMap&&(m.emissiveMap.value=u.emissiveMap,t(u.emissiveMap,m.emissiveMapTransform)),u.specularMap&&(m.specularMap.value=u.specularMap,t(u.specularMap,m.specularMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest);let T=e.get(u),b=T.envMap,S=T.envMapRotation;b&&(m.envMap.value=b,fi.copy(S),fi.x*=-1,fi.y*=-1,fi.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(fi.y*=-1,fi.z*=-1),m.envMapRotation.value.setFromMatrix4(Pm.makeRotationFromEuler(fi)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=u.reflectivity,m.ior.value=u.ior,m.refractionRatio.value=u.refractionRatio),u.lightMap&&(m.lightMap.value=u.lightMap,m.lightMapIntensity.value=u.lightMapIntensity,t(u.lightMap,m.lightMapTransform)),u.aoMap&&(m.aoMap.value=u.aoMap,m.aoMapIntensity.value=u.aoMapIntensity,t(u.aoMap,m.aoMapTransform))}function a(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform))}function o(m,u){m.dashSize.value=u.dashSize,m.totalSize.value=u.dashSize+u.gapSize,m.scale.value=u.scale}function c(m,u,T,b){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.size.value=u.size*T,m.scale.value=b*.5,u.map&&(m.map.value=u.map,t(u.map,m.uvTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function l(m,u){m.diffuse.value.copy(u.color),m.opacity.value=u.opacity,m.rotation.value=u.rotation,u.map&&(m.map.value=u.map,t(u.map,m.mapTransform)),u.alphaMap&&(m.alphaMap.value=u.alphaMap,t(u.alphaMap,m.alphaMapTransform)),u.alphaTest>0&&(m.alphaTest.value=u.alphaTest)}function h(m,u){m.specular.value.copy(u.specular),m.shininess.value=Math.max(u.shininess,1e-4)}function d(m,u){u.gradientMap&&(m.gradientMap.value=u.gradientMap)}function f(m,u){m.metalness.value=u.metalness,u.metalnessMap&&(m.metalnessMap.value=u.metalnessMap,t(u.metalnessMap,m.metalnessMapTransform)),m.roughness.value=u.roughness,u.roughnessMap&&(m.roughnessMap.value=u.roughnessMap,t(u.roughnessMap,m.roughnessMapTransform)),u.envMap&&(m.envMapIntensity.value=u.envMapIntensity)}function p(m,u,T){m.ior.value=u.ior,u.sheen>0&&(m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),m.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(m.sheenColorMap.value=u.sheenColorMap,t(u.sheenColorMap,m.sheenColorMapTransform)),u.sheenRoughnessMap&&(m.sheenRoughnessMap.value=u.sheenRoughnessMap,t(u.sheenRoughnessMap,m.sheenRoughnessMapTransform))),u.clearcoat>0&&(m.clearcoat.value=u.clearcoat,m.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(m.clearcoatMap.value=u.clearcoatMap,t(u.clearcoatMap,m.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,t(u.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(m.clearcoatNormalMap.value=u.clearcoatNormalMap,t(u.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===wt&&m.clearcoatNormalScale.value.negate())),u.dispersion>0&&(m.dispersion.value=u.dispersion),u.iridescence>0&&(m.iridescence.value=u.iridescence,m.iridescenceIOR.value=u.iridescenceIOR,m.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(m.iridescenceMap.value=u.iridescenceMap,t(u.iridescenceMap,m.iridescenceMapTransform)),u.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=u.iridescenceThicknessMap,t(u.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),u.transmission>0&&(m.transmission.value=u.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),u.transmissionMap&&(m.transmissionMap.value=u.transmissionMap,t(u.transmissionMap,m.transmissionMapTransform)),m.thickness.value=u.thickness,u.thicknessMap&&(m.thicknessMap.value=u.thicknessMap,t(u.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=u.attenuationDistance,m.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(m.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(m.anisotropyMap.value=u.anisotropyMap,t(u.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=u.specularIntensity,m.specularColor.value.copy(u.specularColor),u.specularColorMap&&(m.specularColorMap.value=u.specularColorMap,t(u.specularColorMap,m.specularColorMapTransform)),u.specularIntensityMap&&(m.specularIntensityMap.value=u.specularIntensityMap,t(u.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,u){u.matcap&&(m.matcap.value=u.matcap)}function x(m,u){let T=e.get(u).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Dm(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(T,b){let S=b.program;n.uniformBlockBinding(T,S)}function l(T,b){let S=s[T.id];S===void 0&&(g(T),S=h(T),s[T.id]=S,T.addEventListener("dispose",m));let R=b.program;n.updateUBOMapping(T,R);let A=e.render.frame;r[T.id]!==A&&(f(T),r[T.id]=A)}function h(T){let b=d();T.__bindingPointIndex=b;let S=i.createBuffer(),R=T.__size,A=T.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,R,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,S),S}function d(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(T){let b=s[T.id],S=T.uniforms,R=T.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let A=0,P=S.length;A<P;A++){let U=Array.isArray(S[A])?S[A]:[S[A]];for(let y=0,M=U.length;y<M;y++){let C=U[y];if(p(C,A,y,R)===!0){let z=C.__offset,W=Array.isArray(C.value)?C.value:[C.value],O=0;for(let X=0;X<W.length;X++){let q=W[X],ie=x(q);typeof q=="number"||typeof q=="boolean"?(C.__data[0]=q,i.bufferSubData(i.UNIFORM_BUFFER,z+O,C.__data)):q.isMatrix3?(C.__data[0]=q.elements[0],C.__data[1]=q.elements[1],C.__data[2]=q.elements[2],C.__data[3]=0,C.__data[4]=q.elements[3],C.__data[5]=q.elements[4],C.__data[6]=q.elements[5],C.__data[7]=0,C.__data[8]=q.elements[6],C.__data[9]=q.elements[7],C.__data[10]=q.elements[8],C.__data[11]=0):(q.toArray(C.__data,O),O+=ie.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,z,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(T,b,S,R){let A=T.value,P=b+"_"+S;if(R[P]===void 0)return typeof A=="number"||typeof A=="boolean"?R[P]=A:R[P]=A.clone(),!0;{let U=R[P];if(typeof A=="number"||typeof A=="boolean"){if(U!==A)return R[P]=A,!0}else if(U.equals(A)===!1)return U.copy(A),!0}return!1}function g(T){let b=T.uniforms,S=0,R=16;for(let P=0,U=b.length;P<U;P++){let y=Array.isArray(b[P])?b[P]:[b[P]];for(let M=0,C=y.length;M<C;M++){let z=y[M],W=Array.isArray(z.value)?z.value:[z.value];for(let O=0,X=W.length;O<X;O++){let q=W[O],ie=x(q),Y=S%R,V=Y%ie.boundary,Z=Y+V;S+=V,Z!==0&&R-Z<ie.storage&&(S+=R-Z),z.__data=new Float32Array(ie.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=S,S+=ie.storage}}}let A=S%R;return A>0&&(S+=R-A),T.__size=S,T.__cache={},this}function x(T){let b={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(b.boundary=4,b.storage=4):T.isVector2?(b.boundary=8,b.storage=8):T.isVector3||T.isColor?(b.boundary=16,b.storage=12):T.isVector4?(b.boundary=16,b.storage=16):T.isMatrix3?(b.boundary=48,b.storage=48):T.isMatrix4?(b.boundary=64,b.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),b}function m(T){let b=T.target;b.removeEventListener("dispose",m);let S=a.indexOf(b.__bindingPointIndex);a.splice(S,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function u(){for(let T in s)i.deleteBuffer(s[T]);a=[],s={},r={}}return{bind:c,update:l,dispose:u}}var Ua=class{constructor(e={}){let{canvas:t=Ic(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;let g=new Uint32Array(4),x=new Int32Array(4),m=null,u=null,T=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Tn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let S=this,R=!1;this._outputColorSpace=Ft;let A=0,P=0,U=null,y=-1,M=null,C=new lt,z=new lt,W=null,O=new Ve(0),X=0,q=t.width,ie=t.height,Y=1,V=null,Z=null,K=new lt(0,0,q,ie),me=new lt(0,0,q,ie),Se=!1,be=new Ui,_e=!1,D=!1,k=new it,j=new I,pe=new lt,ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function ht(){return U===null?Y:1}let w=n;function We(v,N){return t.getContext(v,N)}try{let v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",le,!1),t.addEventListener("webglcontextrestored",ve,!1),t.addEventListener("webglcontextcreationerror",te,!1),w===null){let N="webgl2";if(w=We(N,v),w===null)throw We(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(v){throw console.error("THREE.WebGLRenderer: "+v.message),v}let Re,Ce,ce,qe,ge,Oe,rt,je,E,_,B,$,ee,J,Ae,oe,Ee,Te,se,fe,Ue,we,ue,ke;function L(){Re=new Kf(w),Re.init(),we=new Rm(w,Re),Ce=new Wf(w,Re,e,we),ce=new wm(w,Re),Ce.reversedDepthBuffer&&f&&ce.buffers.depth.setReversed(!0),qe=new ep(w),ge=new fm,Oe=new Am(w,Re,ce,ge,Ce,we,qe),rt=new qf(S),je=new $f(S),E=new ru(w),ue=new Hf(w,E),_=new Qf(w,E,qe,ue),B=new np(w,_,E,qe),se=new tp(w,Ce,Oe),oe=new Xf(ge),$=new dm(S,rt,je,Re,Ce,ue,oe),ee=new Lm(S,ge),J=new mm,Ae=new Mm(Re),Te=new Vf(S,rt,je,ce,B,p,c),Ee=new Em(S,B,Ce),ke=new Dm(w,qe,Ce,ce),fe=new Gf(w,Re,qe),Ue=new jf(w,Re,qe),qe.programs=$.programs,S.capabilities=Ce,S.extensions=Re,S.properties=ge,S.renderLists=J,S.shadowMap=Ee,S.state=ce,S.info=qe}L();let re=new al(S,w);this.xr=re,this.getContext=function(){return w},this.getContextAttributes=function(){return w.getContextAttributes()},this.forceContextLoss=function(){let v=Re.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=Re.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(v){v!==void 0&&(Y=v,this.setSize(q,ie,!1))},this.getSize=function(v){return v.set(q,ie)},this.setSize=function(v,N,H=!0){if(re.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=v,ie=N,t.width=Math.floor(v*Y),t.height=Math.floor(N*Y),H===!0&&(t.style.width=v+"px",t.style.height=N+"px"),this.setViewport(0,0,v,N)},this.getDrawingBufferSize=function(v){return v.set(q*Y,ie*Y).floor()},this.setDrawingBufferSize=function(v,N,H){q=v,ie=N,Y=H,t.width=Math.floor(v*H),t.height=Math.floor(N*H),this.setViewport(0,0,v,N)},this.getCurrentViewport=function(v){return v.copy(C)},this.getViewport=function(v){return v.copy(K)},this.setViewport=function(v,N,H,G){v.isVector4?K.set(v.x,v.y,v.z,v.w):K.set(v,N,H,G),ce.viewport(C.copy(K).multiplyScalar(Y).round())},this.getScissor=function(v){return v.copy(me)},this.setScissor=function(v,N,H,G){v.isVector4?me.set(v.x,v.y,v.z,v.w):me.set(v,N,H,G),ce.scissor(z.copy(me).multiplyScalar(Y).round())},this.getScissorTest=function(){return Se},this.setScissorTest=function(v){ce.setScissorTest(Se=v)},this.setOpaqueSort=function(v){V=v},this.setTransparentSort=function(v){Z=v},this.getClearColor=function(v){return v.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor(...arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha(...arguments)},this.clear=function(v=!0,N=!0,H=!0){let G=0;if(v){let F=!1;if(U!==null){let ne=U.texture.format;F=ne===ta||ne===ea||ne===jr}if(F){let ne=U.texture.type,de=ne===rn||ne===Xn||ne===Fi||ne===Bi||ne===Kr||ne===Qr,ye=Te.getClearColor(),xe=Te.getClearAlpha(),De=ye.r,Fe=ye.g,Ie=ye.b;de?(g[0]=De,g[1]=Fe,g[2]=Ie,g[3]=xe,w.clearBufferuiv(w.COLOR,0,g)):(x[0]=De,x[1]=Fe,x[2]=Ie,x[3]=xe,w.clearBufferiv(w.COLOR,0,x))}else G|=w.COLOR_BUFFER_BIT}N&&(G|=w.DEPTH_BUFFER_BIT),H&&(G|=w.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),w.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",le,!1),t.removeEventListener("webglcontextrestored",ve,!1),t.removeEventListener("webglcontextcreationerror",te,!1),Te.dispose(),J.dispose(),Ae.dispose(),ge.dispose(),rt.dispose(),je.dispose(),B.dispose(),ue.dispose(),ke.dispose(),$.dispose(),re.dispose(),re.removeEventListener("sessionstart",on),re.removeEventListener("sessionend",dl),Yn.stop()};function le(v){v.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function ve(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;let v=qe.autoReset,N=Ee.enabled,H=Ee.autoUpdate,G=Ee.needsUpdate,F=Ee.type;L(),qe.autoReset=v,Ee.enabled=N,Ee.autoUpdate=H,Ee.needsUpdate=G,Ee.type=F}function te(v){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function Q(v){let N=v.target;N.removeEventListener("dispose",Q),Me(N)}function Me(v){Be(v),ge.remove(v)}function Be(v){let N=ge.get(v).programs;N!==void 0&&(N.forEach(function(H){$.releaseProgram(H)}),v.isShaderMaterial&&$.releaseShaderCache(v))}this.renderBufferDirect=function(v,N,H,G,F,ne){N===null&&(N=ae);let de=F.isMesh&&F.matrixWorld.determinant()<0,ye=dh(v,N,H,G,F);ce.setMaterial(G,de);let xe=H.index,De=1;if(G.wireframe===!0){if(xe=_.getWireframeAttribute(H),xe===void 0)return;De=2}let Fe=H.drawRange,Ie=H.attributes.position,Xe=Fe.start*De,Ke=(Fe.start+Fe.count)*De;ne!==null&&(Xe=Math.max(Xe,ne.start*De),Ke=Math.min(Ke,(ne.start+ne.count)*De)),xe!==null?(Xe=Math.max(Xe,0),Ke=Math.min(Ke,xe.count)):Ie!=null&&(Xe=Math.max(Xe,0),Ke=Math.min(Ke,Ie.count));let ut=Ke-Xe;if(ut<0||ut===1/0)return;ue.setup(F,G,ye,H,xe);let tt,Qe=fe;if(xe!==null&&(tt=E.get(xe),Qe=Ue,Qe.setIndex(tt)),F.isMesh)G.wireframe===!0?(ce.setLineWidth(G.wireframeLinewidth*ht()),Qe.setMode(w.LINES)):Qe.setMode(w.TRIANGLES);else if(F.isLine){let Pe=G.linewidth;Pe===void 0&&(Pe=1),ce.setLineWidth(Pe*ht()),F.isLineSegments?Qe.setMode(w.LINES):F.isLineLoop?Qe.setMode(w.LINE_LOOP):Qe.setMode(w.LINE_STRIP)}else F.isPoints?Qe.setMode(w.POINTS):F.isSprite&&Qe.setMode(w.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Pi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Qe.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Re.get("WEBGL_multi_draw"))Qe.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Pe=F._multiDrawStarts,at=F._multiDrawCounts,Ze=F._multiDrawCount,Lt=xe?E.get(xe).bytesPerElement:1,gi=ge.get(G).currentProgram.getUniforms();for(let Dt=0;Dt<Ze;Dt++)gi.setValue(w,"_gl_DrawID",Dt),Qe.render(Pe[Dt]/Lt,at[Dt])}else if(F.isInstancedMesh)Qe.renderInstances(Xe,ut,F.count);else if(H.isInstancedBufferGeometry){let Pe=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,at=Math.min(H.instanceCount,Pe);Qe.renderInstances(Xe,ut,at)}else Qe.render(Xe,ut)};function et(v,N,H){v.transparent===!0&&v.side===qt&&v.forceSinglePass===!1?(v.side=wt,v.needsUpdate=!0,Ns(v,N,H),v.side=Mn,v.needsUpdate=!0,Ns(v,N,H),v.side=qt):Ns(v,N,H)}this.compile=function(v,N,H=null){H===null&&(H=v),u=Ae.get(H),u.init(N),b.push(u),H.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(u.pushLight(F),F.castShadow&&u.pushShadow(F))}),v!==H&&v.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(u.pushLight(F),F.castShadow&&u.pushShadow(F))}),u.setupLights();let G=new Set;return v.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let ne=F.material;if(ne)if(Array.isArray(ne))for(let de=0;de<ne.length;de++){let ye=ne[de];et(ye,H,F),G.add(ye)}else et(ne,H,F),G.add(ne)}),u=b.pop(),G},this.compileAsync=function(v,N,H=null){let G=this.compile(v,N,H);return new Promise(F=>{function ne(){if(G.forEach(function(de){ge.get(de).currentProgram.isReady()&&G.delete(de)}),G.size===0){F(v);return}setTimeout(ne,10)}Re.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let Je=null;function pn(v){Je&&Je(v)}function on(){Yn.stop()}function dl(){Yn.start()}let Yn=new sh;Yn.setAnimationLoop(pn),typeof self<"u"&&Yn.setContext(self),this.setAnimationLoop=function(v){Je=v,re.setAnimationLoop(v),v===null?Yn.stop():Yn.start()},re.addEventListener("sessionstart",on),re.addEventListener("sessionend",dl),this.render=function(v,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(N),N=re.getCamera()),v.isScene===!0&&v.onBeforeRender(S,v,N,U),u=Ae.get(v,b.length),u.init(N),b.push(u),k.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),be.setFromProjectionMatrix(k,jt,N.reversedDepth),D=this.localClippingEnabled,_e=oe.init(this.clippingPlanes,D),m=J.get(v,T.length),m.init(),T.push(m),re.enabled===!0&&re.isPresenting===!0){let ne=S.xr.getDepthSensingMesh();ne!==null&&Ba(ne,N,-1/0,S.sortObjects)}Ba(v,N,0,S.sortObjects),m.finish(),S.sortObjects===!0&&m.sort(V,Z),Ne=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,Ne&&Te.addToRenderList(m,v),this.info.render.frame++,_e===!0&&oe.beginShadows();let H=u.state.shadowsArray;Ee.render(H,v,N),_e===!0&&oe.endShadows(),this.info.autoReset===!0&&this.info.reset();let G=m.opaque,F=m.transmissive;if(u.setupLights(),N.isArrayCamera){let ne=N.cameras;if(F.length>0)for(let de=0,ye=ne.length;de<ye;de++){let xe=ne[de];pl(G,F,v,xe)}Ne&&Te.render(v);for(let de=0,ye=ne.length;de<ye;de++){let xe=ne[de];fl(m,v,xe,xe.viewport)}}else F.length>0&&pl(G,F,v,N),Ne&&Te.render(v),fl(m,v,N);U!==null&&P===0&&(Oe.updateMultisampleRenderTarget(U),Oe.updateRenderTargetMipmap(U)),v.isScene===!0&&v.onAfterRender(S,v,N),ue.resetDefaultState(),y=-1,M=null,b.pop(),b.length>0?(u=b[b.length-1],_e===!0&&oe.setGlobalState(S.clippingPlanes,u.state.camera)):u=null,T.pop(),T.length>0?m=T[T.length-1]:m=null};function Ba(v,N,H,G){if(v.visible===!1)return;if(v.layers.test(N.layers)){if(v.isGroup)H=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(N);else if(v.isLight)u.pushLight(v),v.castShadow&&u.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||be.intersectsSprite(v)){G&&pe.setFromMatrixPosition(v.matrixWorld).applyMatrix4(k);let de=B.update(v),ye=v.material;ye.visible&&m.push(v,de,ye,H,pe.z,null)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||be.intersectsObject(v))){let de=B.update(v),ye=v.material;if(G&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),pe.copy(v.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),pe.copy(de.boundingSphere.center)),pe.applyMatrix4(v.matrixWorld).applyMatrix4(k)),Array.isArray(ye)){let xe=de.groups;for(let De=0,Fe=xe.length;De<Fe;De++){let Ie=xe[De],Xe=ye[Ie.materialIndex];Xe&&Xe.visible&&m.push(v,de,Xe,H,pe.z,Ie)}}else ye.visible&&m.push(v,de,ye,H,pe.z,null)}}let ne=v.children;for(let de=0,ye=ne.length;de<ye;de++)Ba(ne[de],N,H,G)}function fl(v,N,H,G){let F=v.opaque,ne=v.transmissive,de=v.transparent;u.setupLightsView(H),_e===!0&&oe.setGlobalState(S.clippingPlanes,H),G&&ce.viewport(C.copy(G)),F.length>0&&Us(F,N,H),ne.length>0&&Us(ne,N,H),de.length>0&&Us(de,N,H),ce.buffers.depth.setTest(!0),ce.buffers.depth.setMask(!0),ce.buffers.color.setMask(!0),ce.setPolygonOffset(!1)}function pl(v,N,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;u.state.transmissionRenderTarget[G.id]===void 0&&(u.state.transmissionRenderTarget[G.id]=new cn(1,1,{generateMipmaps:!0,type:Re.has("EXT_color_buffer_half_float")||Re.has("EXT_color_buffer_float")?Oi:rn,minFilter:Wn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ye.workingColorSpace}));let ne=u.state.transmissionRenderTarget[G.id],de=G.viewport||C;ne.setSize(de.z*S.transmissionResolutionScale,de.w*S.transmissionResolutionScale);let ye=S.getRenderTarget(),xe=S.getActiveCubeFace(),De=S.getActiveMipmapLevel();S.setRenderTarget(ne),S.getClearColor(O),X=S.getClearAlpha(),X<1&&S.setClearColor(16777215,.5),S.clear(),Ne&&Te.render(H);let Fe=S.toneMapping;S.toneMapping=Tn;let Ie=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),u.setupLightsView(G),_e===!0&&oe.setGlobalState(S.clippingPlanes,G),Us(v,H,G),Oe.updateMultisampleRenderTarget(ne),Oe.updateRenderTargetMipmap(ne),Re.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let Ke=0,ut=N.length;Ke<ut;Ke++){let tt=N[Ke],Qe=tt.object,Pe=tt.geometry,at=tt.material,Ze=tt.group;if(at.side===qt&&Qe.layers.test(G.layers)){let Lt=at.side;at.side=wt,at.needsUpdate=!0,ml(Qe,H,G,Pe,at,Ze),at.side=Lt,at.needsUpdate=!0,Xe=!0}}Xe===!0&&(Oe.updateMultisampleRenderTarget(ne),Oe.updateRenderTargetMipmap(ne))}S.setRenderTarget(ye,xe,De),S.setClearColor(O,X),Ie!==void 0&&(G.viewport=Ie),S.toneMapping=Fe}function Us(v,N,H){let G=N.isScene===!0?N.overrideMaterial:null;for(let F=0,ne=v.length;F<ne;F++){let de=v[F],ye=de.object,xe=de.geometry,De=de.group,Fe=de.material;Fe.allowOverride===!0&&G!==null&&(Fe=G),ye.layers.test(H.layers)&&ml(ye,N,H,xe,Fe,De)}}function ml(v,N,H,G,F,ne){v.onBeforeRender(S,N,H,G,F,ne),v.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),F.onBeforeRender(S,N,H,G,v,ne),F.transparent===!0&&F.side===qt&&F.forceSinglePass===!1?(F.side=wt,F.needsUpdate=!0,S.renderBufferDirect(H,N,G,F,v,ne),F.side=Mn,F.needsUpdate=!0,S.renderBufferDirect(H,N,G,F,v,ne),F.side=qt):S.renderBufferDirect(H,N,G,F,v,ne),v.onAfterRender(S,N,H,G,F,ne)}function Ns(v,N,H){N.isScene!==!0&&(N=ae);let G=ge.get(v),F=u.state.lights,ne=u.state.shadowsArray,de=F.state.version,ye=$.getParameters(v,F.state,ne,N,H),xe=$.getProgramCacheKey(ye),De=G.programs;G.environment=v.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(v.isMeshStandardMaterial?je:rt).get(v.envMap||G.environment),G.envMapRotation=G.environment!==null&&v.envMap===null?N.environmentRotation:v.envMapRotation,De===void 0&&(v.addEventListener("dispose",Q),De=new Map,G.programs=De);let Fe=De.get(xe);if(Fe!==void 0){if(G.currentProgram===Fe&&G.lightsStateVersion===de)return _l(v,ye),Fe}else ye.uniforms=$.getUniforms(v),v.onBeforeCompile(ye,S),Fe=$.acquireProgram(ye,xe),De.set(xe,Fe),G.uniforms=ye.uniforms;let Ie=G.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Ie.clippingPlanes=oe.uniform),_l(v,ye),G.needsLights=ph(v),G.lightsStateVersion=de,G.needsLights&&(Ie.ambientLightColor.value=F.state.ambient,Ie.lightProbe.value=F.state.probe,Ie.directionalLights.value=F.state.directional,Ie.directionalLightShadows.value=F.state.directionalShadow,Ie.spotLights.value=F.state.spot,Ie.spotLightShadows.value=F.state.spotShadow,Ie.rectAreaLights.value=F.state.rectArea,Ie.ltc_1.value=F.state.rectAreaLTC1,Ie.ltc_2.value=F.state.rectAreaLTC2,Ie.pointLights.value=F.state.point,Ie.pointLightShadows.value=F.state.pointShadow,Ie.hemisphereLights.value=F.state.hemi,Ie.directionalShadowMap.value=F.state.directionalShadowMap,Ie.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ie.spotShadowMap.value=F.state.spotShadowMap,Ie.spotLightMatrix.value=F.state.spotLightMatrix,Ie.spotLightMap.value=F.state.spotLightMap,Ie.pointShadowMap.value=F.state.pointShadowMap,Ie.pointShadowMatrix.value=F.state.pointShadowMatrix),G.currentProgram=Fe,G.uniformsList=null,Fe}function gl(v){if(v.uniformsList===null){let N=v.currentProgram.getUniforms();v.uniformsList=Hi.seqWithValue(N.seq,v.uniforms)}return v.uniformsList}function _l(v,N){let H=ge.get(v);H.outputColorSpace=N.outputColorSpace,H.batching=N.batching,H.batchingColor=N.batchingColor,H.instancing=N.instancing,H.instancingColor=N.instancingColor,H.instancingMorph=N.instancingMorph,H.skinning=N.skinning,H.morphTargets=N.morphTargets,H.morphNormals=N.morphNormals,H.morphColors=N.morphColors,H.morphTargetsCount=N.morphTargetsCount,H.numClippingPlanes=N.numClippingPlanes,H.numIntersection=N.numClipIntersection,H.vertexAlphas=N.vertexAlphas,H.vertexTangents=N.vertexTangents,H.toneMapping=N.toneMapping}function dh(v,N,H,G,F){N.isScene!==!0&&(N=ae),Oe.resetTextureUnits();let ne=N.fog,de=G.isMeshStandardMaterial?N.environment:null,ye=U===null?S.outputColorSpace:U.isXRRenderTarget===!0?U.texture.colorSpace:ni,xe=(G.isMeshStandardMaterial?je:rt).get(G.envMap||de),De=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Fe=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ie=!!H.morphAttributes.position,Xe=!!H.morphAttributes.normal,Ke=!!H.morphAttributes.color,ut=Tn;G.toneMapped&&(U===null||U.isXRRenderTarget===!0)&&(ut=S.toneMapping);let tt=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Qe=tt!==void 0?tt.length:0,Pe=ge.get(G),at=u.state.lights;if(_e===!0&&(D===!0||v!==M)){let bt=v===M&&G.id===y;oe.setState(G,v,bt)}let Ze=!1;G.version===Pe.__version?(Pe.needsLights&&Pe.lightsStateVersion!==at.state.version||Pe.outputColorSpace!==ye||F.isBatchedMesh&&Pe.batching===!1||!F.isBatchedMesh&&Pe.batching===!0||F.isBatchedMesh&&Pe.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Pe.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Pe.instancing===!1||!F.isInstancedMesh&&Pe.instancing===!0||F.isSkinnedMesh&&Pe.skinning===!1||!F.isSkinnedMesh&&Pe.skinning===!0||F.isInstancedMesh&&Pe.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Pe.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Pe.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Pe.instancingMorph===!1&&F.morphTexture!==null||Pe.envMap!==xe||G.fog===!0&&Pe.fog!==ne||Pe.numClippingPlanes!==void 0&&(Pe.numClippingPlanes!==oe.numPlanes||Pe.numIntersection!==oe.numIntersection)||Pe.vertexAlphas!==De||Pe.vertexTangents!==Fe||Pe.morphTargets!==Ie||Pe.morphNormals!==Xe||Pe.morphColors!==Ke||Pe.toneMapping!==ut||Pe.morphTargetsCount!==Qe)&&(Ze=!0):(Ze=!0,Pe.__version=G.version);let Lt=Pe.currentProgram;Ze===!0&&(Lt=Ns(G,N,F));let gi=!1,Dt=!1,Wi=!1,ot=Lt.getUniforms(),kt=Pe.uniforms;if(ce.useProgram(Lt.program)&&(gi=!0,Dt=!0,Wi=!0),G.id!==y&&(y=G.id,Dt=!0),gi||M!==v){ce.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),ot.setValue(w,"projectionMatrix",v.projectionMatrix),ot.setValue(w,"viewMatrix",v.matrixWorldInverse);let Rt=ot.map.cameraPosition;Rt!==void 0&&Rt.setValue(w,j.setFromMatrixPosition(v.matrixWorld)),Ce.logarithmicDepthBuffer&&ot.setValue(w,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ot.setValue(w,"isOrthographic",v.isOrthographicCamera===!0),M!==v&&(M=v,Dt=!0,Wi=!0)}if(F.isSkinnedMesh){ot.setOptional(w,F,"bindMatrix"),ot.setOptional(w,F,"bindMatrixInverse");let bt=F.skeleton;bt&&(bt.boneTexture===null&&bt.computeBoneTexture(),ot.setValue(w,"boneTexture",bt.boneTexture,Oe))}F.isBatchedMesh&&(ot.setOptional(w,F,"batchingTexture"),ot.setValue(w,"batchingTexture",F._matricesTexture,Oe),ot.setOptional(w,F,"batchingIdTexture"),ot.setValue(w,"batchingIdTexture",F._indirectTexture,Oe),ot.setOptional(w,F,"batchingColorTexture"),F._colorsTexture!==null&&ot.setValue(w,"batchingColorTexture",F._colorsTexture,Oe));let Vt=H.morphAttributes;if((Vt.position!==void 0||Vt.normal!==void 0||Vt.color!==void 0)&&se.update(F,H,Lt),(Dt||Pe.receiveShadow!==F.receiveShadow)&&(Pe.receiveShadow=F.receiveShadow,ot.setValue(w,"receiveShadow",F.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(kt.envMap.value=xe,kt.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&N.environment!==null&&(kt.envMapIntensity.value=N.environmentIntensity),Dt&&(ot.setValue(w,"toneMappingExposure",S.toneMappingExposure),Pe.needsLights&&fh(kt,Wi),ne&&G.fog===!0&&ee.refreshFogUniforms(kt,ne),ee.refreshMaterialUniforms(kt,G,Y,ie,u.state.transmissionRenderTarget[v.id]),Hi.upload(w,gl(Pe),kt,Oe)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Hi.upload(w,gl(Pe),kt,Oe),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ot.setValue(w,"center",F.center),ot.setValue(w,"modelViewMatrix",F.modelViewMatrix),ot.setValue(w,"normalMatrix",F.normalMatrix),ot.setValue(w,"modelMatrix",F.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let bt=G.uniformsGroups;for(let Rt=0,za=bt.length;Rt<za;Rt++){let Zn=bt[Rt];ke.update(Zn,Lt),ke.bind(Zn,Lt)}}return Lt}function fh(v,N){v.ambientLightColor.needsUpdate=N,v.lightProbe.needsUpdate=N,v.directionalLights.needsUpdate=N,v.directionalLightShadows.needsUpdate=N,v.pointLights.needsUpdate=N,v.pointLightShadows.needsUpdate=N,v.spotLights.needsUpdate=N,v.spotLightShadows.needsUpdate=N,v.rectAreaLights.needsUpdate=N,v.hemisphereLights.needsUpdate=N}function ph(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return P},this.getRenderTarget=function(){return U},this.setRenderTargetTextures=function(v,N,H){let G=ge.get(v);G.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),ge.get(v.texture).__webglTexture=N,ge.get(v.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:H,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,N){let H=ge.get(v);H.__webglFramebuffer=N,H.__useDefaultFramebuffer=N===void 0};let mh=w.createFramebuffer();this.setRenderTarget=function(v,N=0,H=0){U=v,A=N,P=H;let G=!0,F=null,ne=!1,de=!1;if(v){let xe=ge.get(v);if(xe.__useDefaultFramebuffer!==void 0)ce.bindFramebuffer(w.FRAMEBUFFER,null),G=!1;else if(xe.__webglFramebuffer===void 0)Oe.setupRenderTarget(v);else if(xe.__hasExternalTextures)Oe.rebindTextures(v,ge.get(v.texture).__webglTexture,ge.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Ie=v.depthTexture;if(xe.__boundDepthTexture!==Ie){if(Ie!==null&&ge.has(Ie)&&(v.width!==Ie.image.width||v.height!==Ie.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Oe.setupDepthRenderbuffer(v)}}let De=v.texture;(De.isData3DTexture||De.isDataArrayTexture||De.isCompressedArrayTexture)&&(de=!0);let Fe=ge.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Fe[N])?F=Fe[N][H]:F=Fe[N],ne=!0):v.samples>0&&Oe.useMultisampledRTT(v)===!1?F=ge.get(v).__webglMultisampledFramebuffer:Array.isArray(Fe)?F=Fe[H]:F=Fe,C.copy(v.viewport),z.copy(v.scissor),W=v.scissorTest}else C.copy(K).multiplyScalar(Y).floor(),z.copy(me).multiplyScalar(Y).floor(),W=Se;if(H!==0&&(F=mh),ce.bindFramebuffer(w.FRAMEBUFFER,F)&&G&&ce.drawBuffers(v,F),ce.viewport(C),ce.scissor(z),ce.setScissorTest(W),ne){let xe=ge.get(v.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_CUBE_MAP_POSITIVE_X+N,xe.__webglTexture,H)}else if(de){let xe=N;for(let De=0;De<v.textures.length;De++){let Fe=ge.get(v.textures[De]);w.framebufferTextureLayer(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0+De,Fe.__webglTexture,H,xe)}}else if(v!==null&&H!==0){let xe=ge.get(v.texture);w.framebufferTexture2D(w.FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,xe.__webglTexture,H)}y=-1},this.readRenderTargetPixels=function(v,N,H,G,F,ne,de,ye=0){if(!(v&&v.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=ge.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){ce.bindFramebuffer(w.FRAMEBUFFER,xe);try{let De=v.textures[ye],Fe=De.format,Ie=De.type;if(!Ce.textureFormatReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ce.textureTypeReadable(Ie)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=v.width-G&&H>=0&&H<=v.height-F&&(v.textures.length>1&&w.readBuffer(w.COLOR_ATTACHMENT0+ye),w.readPixels(N,H,G,F,we.convert(Fe),we.convert(Ie),ne))}finally{let De=U!==null?ge.get(U).__webglFramebuffer:null;ce.bindFramebuffer(w.FRAMEBUFFER,De)}}},this.readRenderTargetPixelsAsync=async function(v,N,H,G,F,ne,de,ye=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=ge.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe)if(N>=0&&N<=v.width-G&&H>=0&&H<=v.height-F){ce.bindFramebuffer(w.FRAMEBUFFER,xe);let De=v.textures[ye],Fe=De.format,Ie=De.type;if(!Ce.textureFormatReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ce.textureTypeReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Xe=w.createBuffer();w.bindBuffer(w.PIXEL_PACK_BUFFER,Xe),w.bufferData(w.PIXEL_PACK_BUFFER,ne.byteLength,w.STREAM_READ),v.textures.length>1&&w.readBuffer(w.COLOR_ATTACHMENT0+ye),w.readPixels(N,H,G,F,we.convert(Fe),we.convert(Ie),0);let Ke=U!==null?ge.get(U).__webglFramebuffer:null;ce.bindFramebuffer(w.FRAMEBUFFER,Ke);let ut=w.fenceSync(w.SYNC_GPU_COMMANDS_COMPLETE,0);return w.flush(),await Pc(w,ut,4),w.bindBuffer(w.PIXEL_PACK_BUFFER,Xe),w.getBufferSubData(w.PIXEL_PACK_BUFFER,0,ne),w.deleteBuffer(Xe),w.deleteSync(ut),ne}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,N=null,H=0){let G=Math.pow(2,-H),F=Math.floor(v.image.width*G),ne=Math.floor(v.image.height*G),de=N!==null?N.x:0,ye=N!==null?N.y:0;Oe.setTexture2D(v,0),w.copyTexSubImage2D(w.TEXTURE_2D,H,0,0,de,ye,F,ne),ce.unbindTexture()};let gh=w.createFramebuffer(),_h=w.createFramebuffer();this.copyTextureToTexture=function(v,N,H=null,G=null,F=0,ne=null){ne===null&&(F!==0?(Pi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ne=F,F=0):ne=0);let de,ye,xe,De,Fe,Ie,Xe,Ke,ut,tt=v.isCompressedTexture?v.mipmaps[ne]:v.image;if(H!==null)de=H.max.x-H.min.x,ye=H.max.y-H.min.y,xe=H.isBox3?H.max.z-H.min.z:1,De=H.min.x,Fe=H.min.y,Ie=H.isBox3?H.min.z:0;else{let Vt=Math.pow(2,-F);de=Math.floor(tt.width*Vt),ye=Math.floor(tt.height*Vt),v.isDataArrayTexture?xe=tt.depth:v.isData3DTexture?xe=Math.floor(tt.depth*Vt):xe=1,De=0,Fe=0,Ie=0}G!==null?(Xe=G.x,Ke=G.y,ut=G.z):(Xe=0,Ke=0,ut=0);let Qe=we.convert(N.format),Pe=we.convert(N.type),at;N.isData3DTexture?(Oe.setTexture3D(N,0),at=w.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Oe.setTexture2DArray(N,0),at=w.TEXTURE_2D_ARRAY):(Oe.setTexture2D(N,0),at=w.TEXTURE_2D),w.pixelStorei(w.UNPACK_FLIP_Y_WEBGL,N.flipY),w.pixelStorei(w.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),w.pixelStorei(w.UNPACK_ALIGNMENT,N.unpackAlignment);let Ze=w.getParameter(w.UNPACK_ROW_LENGTH),Lt=w.getParameter(w.UNPACK_IMAGE_HEIGHT),gi=w.getParameter(w.UNPACK_SKIP_PIXELS),Dt=w.getParameter(w.UNPACK_SKIP_ROWS),Wi=w.getParameter(w.UNPACK_SKIP_IMAGES);w.pixelStorei(w.UNPACK_ROW_LENGTH,tt.width),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,tt.height),w.pixelStorei(w.UNPACK_SKIP_PIXELS,De),w.pixelStorei(w.UNPACK_SKIP_ROWS,Fe),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Ie);let ot=v.isDataArrayTexture||v.isData3DTexture,kt=N.isDataArrayTexture||N.isData3DTexture;if(v.isDepthTexture){let Vt=ge.get(v),bt=ge.get(N),Rt=ge.get(Vt.__renderTarget),za=ge.get(bt.__renderTarget);ce.bindFramebuffer(w.READ_FRAMEBUFFER,Rt.__webglFramebuffer),ce.bindFramebuffer(w.DRAW_FRAMEBUFFER,za.__webglFramebuffer);for(let Zn=0;Zn<xe;Zn++)ot&&(w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,ge.get(v).__webglTexture,F,Ie+Zn),w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,ge.get(N).__webglTexture,ne,ut+Zn)),w.blitFramebuffer(De,Fe,de,ye,Xe,Ke,de,ye,w.DEPTH_BUFFER_BIT,w.NEAREST);ce.bindFramebuffer(w.READ_FRAMEBUFFER,null),ce.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else if(F!==0||v.isRenderTargetTexture||ge.has(v)){let Vt=ge.get(v),bt=ge.get(N);ce.bindFramebuffer(w.READ_FRAMEBUFFER,gh),ce.bindFramebuffer(w.DRAW_FRAMEBUFFER,_h);for(let Rt=0;Rt<xe;Rt++)ot?w.framebufferTextureLayer(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,Vt.__webglTexture,F,Ie+Rt):w.framebufferTexture2D(w.READ_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,Vt.__webglTexture,F),kt?w.framebufferTextureLayer(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,bt.__webglTexture,ne,ut+Rt):w.framebufferTexture2D(w.DRAW_FRAMEBUFFER,w.COLOR_ATTACHMENT0,w.TEXTURE_2D,bt.__webglTexture,ne),F!==0?w.blitFramebuffer(De,Fe,de,ye,Xe,Ke,de,ye,w.COLOR_BUFFER_BIT,w.NEAREST):kt?w.copyTexSubImage3D(at,ne,Xe,Ke,ut+Rt,De,Fe,de,ye):w.copyTexSubImage2D(at,ne,Xe,Ke,De,Fe,de,ye);ce.bindFramebuffer(w.READ_FRAMEBUFFER,null),ce.bindFramebuffer(w.DRAW_FRAMEBUFFER,null)}else kt?v.isDataTexture||v.isData3DTexture?w.texSubImage3D(at,ne,Xe,Ke,ut,de,ye,xe,Qe,Pe,tt.data):N.isCompressedArrayTexture?w.compressedTexSubImage3D(at,ne,Xe,Ke,ut,de,ye,xe,Qe,tt.data):w.texSubImage3D(at,ne,Xe,Ke,ut,de,ye,xe,Qe,Pe,tt):v.isDataTexture?w.texSubImage2D(w.TEXTURE_2D,ne,Xe,Ke,de,ye,Qe,Pe,tt.data):v.isCompressedTexture?w.compressedTexSubImage2D(w.TEXTURE_2D,ne,Xe,Ke,tt.width,tt.height,Qe,tt.data):w.texSubImage2D(w.TEXTURE_2D,ne,Xe,Ke,de,ye,Qe,Pe,tt);w.pixelStorei(w.UNPACK_ROW_LENGTH,Ze),w.pixelStorei(w.UNPACK_IMAGE_HEIGHT,Lt),w.pixelStorei(w.UNPACK_SKIP_PIXELS,gi),w.pixelStorei(w.UNPACK_SKIP_ROWS,Dt),w.pixelStorei(w.UNPACK_SKIP_IMAGES,Wi),ne===0&&N.generateMipmaps&&w.generateMipmap(at),ce.unbindTexture()},this.initRenderTarget=function(v){ge.get(v).__webglFramebuffer===void 0&&Oe.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Oe.setTextureCube(v,0):v.isData3DTexture?Oe.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Oe.setTexture2DArray(v,0):Oe.setTexture2D(v,0),ce.unbindTexture()},this.resetState=function(){A=0,P=0,U=null,ce.reset(),ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return jt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ye._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ye._getUnpackColorSpace()}};var Cs=new I;function Zt(i,e,t,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),c=Math.PI/4;Cs.copy(e),Cs[n]=0,Cs.normalize();let l=.5*a/(a+o),h=1-Cs.angleTo(i)/c;return Math.sign(Cs[t])===1?h*l:o/(a+o)+l+l*(1-h)}var Is=class i extends zn{constructor(e=1,t=1,n=1,s=2,r=.1){let a=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let c=new I,l=new I,h=new I(e,t,n).divideScalar(2).subScalar(r),d=this.attributes.position.array,f=this.attributes.normal.array,p=this.attributes.uv.array,g=d.length/6,x=new I,m=.5/a;for(let u=0,T=0;u<d.length;u+=3,T+=2)switch(c.fromArray(d,u),l.copy(c),l.x-=Math.sign(l.x)*m,l.y-=Math.sign(l.y)*m,l.z-=Math.sign(l.z)*m,l.normalize(),d[u+0]=h.x*Math.sign(c.x)+l.x*r,d[u+1]=h.y*Math.sign(c.y)+l.y*r,d[u+2]=h.z*Math.sign(c.z)+l.z*r,f[u+0]=l.x,f[u+1]=l.y,f[u+2]=l.z,Math.floor(u/g)){case 0:x.set(1,0,0),p[T+0]=Zt(x,l,"z","y",r,n),p[T+1]=1-Zt(x,l,"y","z",r,t);break;case 1:x.set(-1,0,0),p[T+0]=1-Zt(x,l,"z","y",r,n),p[T+1]=1-Zt(x,l,"y","z",r,t);break;case 2:x.set(0,1,0),p[T+0]=1-Zt(x,l,"x","z",r,e),p[T+1]=Zt(x,l,"z","x",r,n);break;case 3:x.set(0,-1,0),p[T+0]=1-Zt(x,l,"x","z",r,e),p[T+1]=1-Zt(x,l,"z","x",r,n);break;case 4:x.set(0,0,1),p[T+0]=1-Zt(x,l,"x","y",r,e),p[T+1]=1-Zt(x,l,"y","x",r,t);break;case 5:x.set(0,0,-1),p[T+0]=Zt(x,l,"x","y",r,e),p[T+1]=1-Zt(x,l,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var dt=(i,e,t=1)=>i.map((n,s)=>n+e[s]*t),an=(i,e)=>i.map((t,n)=>t-e[n]),Um=(i,e)=>i.reduce((t,n,s)=>t+n*e[s],0),Ls=i=>Math.hypot(...i),Jt=i=>{let e=Ls(i);if(e<1e-8)throw Error("Degenerate scene direction");return i.map(t=>t/e)},An=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]],At=i=>[i[0]/100,(186-i[1])/100,i[2]/100],Pt=i=>[i[0],-i[1],i[2]],qn=i=>new I(...i),Nm={above:[35,-55],angle:[55,-15],side:[90,0],front:[0,0],back:[180,0]};function ll(i,e,t){let n=Jt(an(e,i)),s=an(t,n.map(r=>r*Um(t,n)));return Ls(s)<1e-5&&(s=An(n,Math.abs(n[0])<.8?[1,0,0]:[0,0,1])),s=Jt(s),{x:s,y:Jt(An(n,s)),z:n}}function Fa(i,e,t){return new tn().setFromRotationMatrix(new it().makeBasis(qn(i),qn(e),qn(t)))}function zt(i,e=24){return new ms({color:i,shininess:e,specular:4015443,side:qt})}function ct(i,e,t,n){let s=new Tt(e,t);return s.name=n,s.castShadow=!0,s.receiveShadow=!0,i.add(s),s}function cl(i,e){let t=new pt,n=[];t.setAttribute("position",new xt(new Float32Array((i+1)*(e+1)*3),3));for(let s=0;s<i;s++)for(let r=0;r<e;r++){let a=s*(e+1)+r,o=a+1,c=a+e+1;n.push(a,c,o,o,c,c+1)}return t.setIndex(n),t}function hl(i,e,t,n){let s=i.attributes.position,r=0;for(let a=0;a<=e;a++)for(let o=0;o<=t;o++){let c=At(n(a/e,o/t));s.setXYZ(r++,...c)}s.needsUpdate=!0,i.computeVertexNormals(),i.computeBoundingSphere(),i.computeBoundingBox()}function Fm(i,e){return e>18&&i.waist?dt(i.waist,i.chestU||i.u,e-18):dt(i.hip,i.u,e)}function hh(i,e){for(let t=1;t<i.length;t++)if(e<=i[t][0]){let n=i[t-1],s=i[t],r=(e-n[0])/(s[0]-n[0]);return[n[1]+(s[1]-n[1])*r,n[2]+(s[2]-n[2])*r]}return i.at(-1).slice(1)}function Oa(i,e,t){i.position.fromArray(At(e)),i.scale.set(...t.map(n=>n/100))}function Ps(i,e,t,n){let s=an(t,e),r=Ls(s);i.visible=r>1e-5,i.visible&&(i.position.fromArray(At(dt(e,t).map(a=>a/2))),i.scale.set(n/200,r/100,n/200),i.quaternion.setFromUnitVectors(new I(0,1,0),qn(Pt(Jt(s)))))}function uh(i,{coarse:e=!1}={}){let t=e?5:10,n=e?8:16,s=e?12:24,r=new hs;r.background=new Ve("#101722");let a=zt("#9aaac1"),o=zt("#8c9fb9"),c=zt("#43526d",12),l=zt("#283549",12),h={steel:zt("#425570",62),bar:zt("#bbc9db",105),pad:zt("#35445c",10),plate:zt("#263e5c",44),cable:zt("#74859b"),band:zt("#709ec4"),mat:zt("#1a293b",5)};r.add(new xs(14280703,.6));let d=new Ni(16184298,.7);d.position.set(-2,5,3),r.add(d);let f=new Ni(11126015,.25);f.position.set(3,2,-4),r.add(f);let p=ct(r,new ri(12,12),zt("#0d1622",5),"floor");p.rotation.x=-Math.PI/2,p.position.y=-.014,p.castShadow=!1;let g=new vs(5,20,2832976,2832976);g.position.set(0,-.01,1),g.material.transparent=!0,g.material.opacity=.4,r.add(g);let x=ct(r,cl(i.torsoRings.length-1,s),a,"torso"),m=ct(r,new hn(1,18,12),a,"head"),u=ct(r,new hn(1,10,8),o,"nose"),T=ct(r,new Wt(1,1,1,12),a,"neck"),b={},S=new Et;S.name="joint-dots",r.add(S);let R=new Bn({color:"#e2f1ff",depthTest:!1});for(let V of["L","R"]){for(let[D,k,j]of[["ua","sh","el"],["fa","el","wr"],["th","hip","kn"],["sh","kn","an"]])b[D+V]={a:k+V,b:j+V,mesh:ct(r,cl(t,n),a,D+V)};for(let[D,k]of[["sh",6.4],["el",4.3],["kn",5.2]])b[D+"-joint"+V]={r:k,mesh:ct(r,new hn(1,14,10),o,D+"-joint"+V)};let Z=new Et;Z.name="hand"+V,r.add(Z),ct(Z,new hn(1,14,10),a,"palm"+V).scale.set(.039,.034,.026);for(let D=0;D<4;D++){let k=Array.from({length:10},(j,pe)=>{let ae=-2+pe/9*4.65;return new I((D-1.5)*.017,.021*Math.cos(ae),.021*Math.sin(ae))});ct(Z,new ai(new Vn(k),12,.0065,5,!1),a,"finger")}let me=V==="L"?-1:1,Se=[[me*.028,-.018,-.017],[me*.043,.01,-.02],[me*.031,.023,.004]].map(D=>qn(D));ct(Z,new ai(new Vn(Se),8,.008,6,!1),a,"thumb");let be=ct(r,new Is(1,1,1,2,.04),l,"shoe"+V);b["hand"+V]={mesh:Z},b["shoe"+V]={mesh:be};let _e=ct(r,cl(2,16),c,"shorts"+V);b["shorts"+V]={mesh:_e};for(let D of["sh","el","wr","hip","kn","an"]){let k=ct(S,new hn(.021,8,6),R,D+V);b["dot"+D+V]={mesh:k}}}let A=new Map,P=new Et;P.name="regions",r.add(P);let U=new Et;U.name="equipment",r.add(U);let y=[],M,C={};function z(V,Z){let K=new Et;K.name="prop-"+Z+"-"+V.kind,U.add(K);let me=h[V.tone]||h.steel;if(V.kind==="box"||V.kind==="panel")ct(K,new Is(1,1,1,2,.012),me,"pad");else if(V.kind==="line")ct(K,new Wt(1,1,1,12),me,"beam");else if(["wheel","roller","weight"].includes(V.kind))ct(K,new Wt(1,1,1,18),V.kind==="weight"?h.plate:me,"cylinder");else if(["barbell","dumbbell"].includes(V.kind)){ct(K,new Wt(1,1,1,18),h.bar,"shaft");for(let Se of[-1,1]){let be=ct(K,new Wt(1,1,1,20),h.plate,"plate");be.userData.sign=Se;let _e=ct(K,new Wt(1,1,1,12),h.bar,"collar");if(_e.userData.sign=Se,V.kind==="barbell"){let D=ct(K,new Wt(1,1,1,16),h.bar,"sleeve");D.userData.sign=Se}}}else if(V.kind==="kettlebell"){let Se=ct(K,new hn(1,18,12),h.plate,"kettlebell-body"),be=Array.from({length:13},(_e,D)=>new I(-.055+D/12*.11,.042*Math.sin(Math.PI*D/12),0));ct(K,new ai(new Vn(be),14,.008,7,!1),h.bar,"kettlebell-handle")}else throw Error("Unknown scene prop "+V.kind);return{group:K,kind:V.kind}}function W(V,Z){let K=V.group,me=Z.c,Se=Z.axis||[1,0,0];if(K.visible=!0,Z.kind==="box"){let be=K.children[0],_e=an(Z.hi,Z.lo);be.position.fromArray(At(dt(Z.lo,Z.hi).map(D=>D/2))),be.scale.set(..._e.map(D=>Math.max(.002,D/100)))}else if(Z.kind==="line")Ps(K.children[0],Z.a,Z.b,Z.width);else if(Z.kind==="panel"){let be=K.children[0],_e=ll(Z.a,Z.b,[1,0,0]);be.position.fromArray(At(dt(Z.a,Z.b).map(D=>D/2))),be.quaternion.copy(Fa(Pt(_e.x),Pt(_e.y),Pt(_e.z).map(D=>-D))),be.scale.set(Z.width/100,Z.thickness/100,Ls(an(Z.b,Z.a))/100)}else if(["wheel","roller","weight"].includes(Z.kind)){let be=K.children[0];be.position.fromArray(At(me)),be.quaternion.setFromUnitVectors(new I(0,1,0),qn(Pt(Jt(Se))));let _e=(Z.radius||6)/100;be.scale.set(_e,Z.kind==="roller"?.36:.055,_e)}else if(["barbell","dumbbell"].includes(Z.kind)){let be=Z.kind==="barbell",_e=be?61:12,D=be?48:9,k=be?Z.radius||17:6,j=K.children[0];Ps(j,dt(me,Se,-_e),dt(me,Se,_e),be?2.8:2.4);for(let pe of K.children.slice(1)){if(pe.name==="sleeve"){Ps(pe,dt(me,Se,34*pe.userData.sign),dt(me,Se,61*pe.userData.sign),5);continue}let ae=pe.name==="collar",Ne=D+(ae?3:0);pe.position.fromArray(At(dt(me,Se,Ne*pe.userData.sign))),pe.quaternion.setFromUnitVectors(new I(0,1,0),qn(Pt(Jt(Se)))),pe.scale.set((ae?3.5:k)/100,ae?.018:be?.05:.035,(ae?3.5:k)/100)}}else if(Z.kind==="kettlebell"){Oa(K.children[0],me,[Z.radius||8.5,Z.radius||8.5,Z.radius||8.5]);let be=K.children[1],_e=Jt(an(me,Z.grip)),D=[1,0,0],k=Jt(An(D,_e));be.position.fromArray(At(dt(Z.grip,_e,3))),be.quaternion.copy(Fa(Pt(D),Pt(_e).map(j=>-j),Pt(k)))}}function O(V,Z={}){M=V,C={...C,...Z};let K=V.pose;hl(x.geometry,V.torsoRings.length-1,s,(D,k)=>{let j=Math.min(V.torsoRings.length-2,Math.floor(D*(V.torsoRings.length-1))),pe=D*(V.torsoRings.length-1)-j,ae=V.torsoRings[j],Ne=V.torsoRings[j+1],ht=ae[0]+(Ne[0]-ae[0])*pe,w=ae[1]+(Ne[1]-ae[1])*pe,We=ae[2]+(Ne[2]-ae[2])*pe,Re=ae[3]+(Ne[3]-ae[3])*pe,Ce=k*Math.PI*2,ce=Math.cos(Ce);return dt(dt(Fm(K,ht),K.x,w*Math.sin(Ce)),K.chestN||K.n,(ce>=0?We:Re)*ce)}),Oa(m,K.head,[8.8,12.3,10]);let me=Pt(K.headU),Se=Pt(K.headN),be=Jt(An(me,Se));m.quaternion.copy(Fa(be,me,Se)),Oa(u,dt(K.head,K.headN,9.5),[1.7,2,3]),Ps(T,dt(K.sh,K.chestU||K.u,-2),K.head,8.5);for(let D of["L","R"]){for(let ce of["ua","fa","th","sh"]){let qe=b[ce+D],ge=K[qe.a],Oe=K[qe.b],rt=ll(ge,Oe,ce==="th"||ce==="sh"?An(K.x,an(Oe,ge)):K.n),je=V.limbProfiles[ce];hl(qe.mesh.geometry,t,n,(E,_)=>{let[B,$]=hh(je,E),ee=_*Math.PI*2;return dt(dt(dt(ge,an(Oe,ge),E),rt.x,B*Math.cos(ee)),rt.y,$*Math.sin(ee))})}for(let ce of["sh","el","kn"]){let qe=b[ce+"-joint"+D];Oa(qe.mesh,K[ce+D],[qe.r,qe.r,qe.r])}let k=b["hand"+D].mesh;k.position.fromArray(At(K["grip"+D]));let j=Jt(an(K["grip"+D],K["wr"+D])),pe=[1,0,0],ae=An(pe,j);Ls(ae)<.01&&(ae=An(pe,[0,1,0])),ae=Jt(ae),k.quaternion.copy(Fa(Pt(pe),Pt(Jt(An(ae,pe))),Pt(ae).map(ce=>-ce)));let Ne=K["heel"+D],ht=K["toe"+D],w=b["shoe"+D].mesh;Ps(w,Ne,ht,8),w.scale.x=.095,w.scale.z=.055;let We=K["hip"+D],Re=K["kn"+D],Ce=ll(We,Re,An(K.x,an(Re,We)));hl(b["shorts"+D].mesh.geometry,2,16,(ce,qe)=>{let ge=ce*.145,[Oe,rt]=hh(V.limbProfiles.th,ge),je=qe*Math.PI*2;return dt(dt(dt(We,an(Re,We),ge),Ce.x,(Oe+.2)*Math.cos(je)),Ce.y,(rt+.2)*Math.sin(je))});for(let ce of["sh","el","wr","hip","kn","an"])b["dot"+ce+D].mesh.position.fromArray(At(K[ce+D]))}S.visible=!!C.joints;let _e=new Map;for(let D of V.surfaces){let k=D.id+":"+D.side;_e.has(k)||_e.set(k,[]),_e.get(k).push(D)}for(let[D,k]of _e){let j=A.get(D);if(!j){let We=new pt;We.setAttribute("position",new xt(new Float32Array(k.length*6*3),3));let Re=zt("#a7b3c6");Re.polygonOffset=!0,Re.polygonOffsetFactor=-1,Re.polygonOffsetUnits=-1,j=ct(P,We,Re,D),j.userData={region:k[0].id,side:k[0].side},A.set(D,j)}j.geometry.attributes.position.count!==k.length*6&&(j.geometry.dispose(),j.geometry=new pt,j.geometry.setAttribute("position",new xt(new Float32Array(k.length*6*3),3)));let pe=0,ae=j.geometry.attributes.position;for(let We of k)for(let Re of[0,1,2,0,2,3])ae.setXYZ(pe++,...At(We.points[Re]));ae.needsUpdate=!0,j.geometry.computeVertexNormals(),j.geometry.computeBoundingSphere(),j.geometry.computeBoundingBox();let Ne=k[0].id,ht=k[0].side,w=C.muscles!==!1&&(!C.selected||C.selected==="all"||C.selected===Ne||C.selected===k[0].parent);j.visible=C.muscles!==!1,j.material.color.set(w?C.color(V.sideValues?.[ht]?.[Ne]??V.values[Ne]??.28):"#9aaac1")}(y.length!==V.props.length||y.some((D,k)=>D.kind!==V.props[k].kind))&&(U.traverse(D=>D.geometry?.dispose()),U.clear(),y=V.props.map(z)),V.props.forEach((D,k)=>W(y[k],D)),r.updateMatrixWorld(!0)}let X=Object.fromEntries(Object.entries(Nm).map(([V,[Z,K]])=>{let me=Z*Math.PI/180,Se=K*Math.PI/180,be=[-Math.sin(me)*Math.cos(Se),-Math.sin(Se),Math.cos(me)*Math.cos(Se)],_e=new li(-1,1,1,-1,.01,30);return _e.position.fromArray(be.map(D=>D*8)),_e.lookAt(0,0,0),_e.updateMatrixWorld(!0),[V,_e]})),q=Object.fromEntries(Object.keys(X).map(V=>[V,{minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0}]));function ie(){r.traverse(V=>{if(!V.isMesh||!V.visible||V===p||V.parent===S)return;V.geometry.boundingBox||V.geometry.computeBoundingBox();let Z=V.geometry.boundingBox;for(let K of[Z.min.x,Z.max.x])for(let me of[Z.min.y,Z.max.y])for(let Se of[Z.min.z,Z.max.z]){let be=qn([K,me,Se]).applyMatrix4(V.matrixWorld);for(let[_e,D]of Object.entries(X)){let k=be.clone().applyMatrix4(D.matrixWorldInverse),j=q[_e];j.minX=Math.min(j.minX,k.x),j.maxX=Math.max(j.maxX,k.x),j.minY=Math.min(j.minY,k.y),j.maxY=Math.max(j.maxY,k.y)}}})}function Y(V,Z){for(let[K,me]of Object.entries(X)){let Se=q[K],be=(Se.minX+Se.maxX)/2,_e=(Se.minY+Se.maxY)/2,D=(Se.maxX-Se.minX)*1.13,k=(Se.maxY-Se.minY)*1.13,j=V/Z;D/k<j?D=k*j:k=D/j,me.left=be-D/2,me.right=be+D/2,me.top=_e+k/2,me.bottom=_e-k/2,me.updateProjectionMatrix()}}return O(i,{color:()=>"#a7b3c6"}),{scene:r,cameras:X,apply:O,includeBounds:ie,resize:Y,bounds:q,regionMeshes:A,parts:b,body:x,head:m,propNodes:()=>y,dispose(){let V=new Set;r.traverse(Z=>{if(Z.geometry?.dispose(),Z.material)for(let K of[].concat(Z.material))V.add(K)});for(let Z of V)Z.dispose()}}}var ul=!1,Ds=new Map;function Om(i){if(ul)return null;if(typeof window.WebGL2RenderingContext>"u")return ul=!0,null;let e=document.createElement("div");e.className="fig volume-figure",e.setAttribute("role","img"),e.setAttribute("aria-label",i.label),e.dataset.camera=i.camera||"above";let t=document.createElement("canvas"),n={antialias:!0,alpha:!1,powerPreference:"low-power"},s,r;try{r=t.getContext("webgl2",n),r&&(s=new Ua({canvas:t,context:r,...n}),s.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)))}catch{s=null}if(!s)return ul=!0,r?.getExtension("WEBGL_lose_context")?.loseContext(),null;e.dataset.renderer="webgl";let a=(O,X)=>i.data(O,X,!1),o=a(0,0),c=uh(o),l=c.cameras;e.append(s.domElement);let h=!1,d=i.t||0,f=0,p=i.camera||"above",g="all",x=i.muscles!==!1,m=!!i.joints;if(!l[p])throw Error("Unknown volume camera "+p);let u=(O,X)=>c.apply(a(O,X),{color:i.color,selected:g,muscles:x,joints:m}),T=new si(new pt().setFromPoints(i.trace.map(O=>new I(...At(O)))),new kn({color:"#b4c3d9",transparent:!0,opacity:.7}));T.visible=!1,c.scene.add(T);let b=new Et;b.name="movement-vectors",b.visible=!1,c.scene.add(b);for(let O of i.vectors){let X=new I(...At(O.a)),q=new I(...At(O.b)),ie=q.clone().sub(X);b.add(new ys(ie.clone().normalize(),X,ie.length(),/^(sh|hip)$/.test(O.key)?7842259:15298901,.075,.035))}let S=JSON.stringify([o.exerciseId,o.props,i.vectors]),R=Ds.get(S);if(R)for(let O of Object.keys(c.bounds))Object.assign(c.bounds[O],R[O]);else{for(let O=0;O<=24;O++)u(O/24,0),c.includeBounds();Ds.set(S,Object.fromEntries(Object.entries(c.bounds).map(([O,X])=>[O,{...X}]))),Ds.size>256&&Ds.delete(Ds.keys().next().value)}u(d,0);function A(){h||s.render(c.scene,l[p])}function P(){if(h)return;let O=e.getBoundingClientRect(),X=Math.max(1,Math.min(1100,O.width||620)),q=Math.max(1,Math.round(O.height||X/(i.ratio||1.15)));s.setSize(X,q),c.resize(X,q),A()}function U(O,X){h||(d=O,f=X?.index||0,u(O,f),e.dataset.pose=String(O),e.dataset.phase=String(f),A())}let y=()=>{h||(u(d,f),P())};t.addEventListener("webglcontextrestored",y);let M=typeof ResizeObserver=="function"?new ResizeObserver(P):null;M?.observe(e),P();let C=O=>{x=!!O,U(d,{index:f})},z=O=>{g=O,U(d,{index:f})},W=O=>{m=!!O,U(d,{index:f})};return U(d,{index:f}),{svg:e,at:U,camera:p,setMuscles:C,setRegion:z,setJoints:W,setTrace(O){T.visible=!!O,A()},setVectors(O){b.visible=!!O,A()},dispose(){h||(h=!0,t.removeEventListener("webglcontextrestored",y),M?.disconnect(),c.dispose(),s.dispose?.(),s.forceContextLoss?.())}}}window.GymVolume={create:Om};})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
