// Author:CMH
// Title:BreathingGlow
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}


float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(-0.230,-0.790)))*
        43758.5453123);
}



vec2 hash2( vec2 x )        //亂數範圍 [-1,1]
    {
        const vec2 k = vec2(0.210,0.610);
        x = x*k + k.yx;
        return -.5 + 4.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
    }


float gnoise( in vec2 p )   //亂數範圍 [-1,1]
    {
        vec2 i = floor( p );
        vec2 f = fract( p );
        
        vec2 u = f*f*(3.0-2.0*f);
    
        return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
            mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }

float fbm(in vec2 uv)       //亂數範圍 [-1,1]
    {
        float f;                //fbm - fractal noise (4 octaves)
        mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
        f   = 0.5000*gnoise( uv ); uv = m*uv;		  
        f += 0.2500*gnoise( uv ); uv = m*uv;
        f += 0.1250*gnoise( uv ); uv = m*uv;
        f += 0.0625*gnoise( uv ); uv = m*uv;
        return f;
    }

float sdStar5(in vec2 p, in float r, in float rf)
{
    const vec2 k1 = vec2(0.809016994375, -0.587785252292);
    const vec2 k2 = vec2(-k1.x,k1.y);
    p.x = abs(p.x);
    p -= 2.0*max(dot(k1,p),0.0)*k1;
    p -= 2.0*max(dot(k2,p),0.0)*k2;
    p.x = abs(p.x);
    p.y -= r;
    vec2 ba = rf*vec2(-k1.y,k1.x) - vec2(0,1);
    float h = clamp( dot(p,ba)/dot(ba,ba), 0.0, r );
    return length(p-ba*h) * sign(p.y*ba.x-p.x*ba.y);
}


float sdHexagram( in vec2 p, in float r )
{
    const vec4 k = vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
}





void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    uv= uv*2.0-1.0;
    
    //定義霧
    float pi=3.14159;
    float info=fbm(1.*uv*abs(sin(u_time/8.0*pi)/2.) + u_time*vec2(.3,.1)*1.);
    
    float result;
    float result_2;

    for (int index=0;index<15;++index){
    
    //定義noise 
    float freq=float(index);
    float weight= smoothstep(.5,.05,uv.y);
    float noise= gnoise(uv* abs(sin(u_time/8.0*pi)/2.));
    float noise_2= gnoise(uv*3.*abs(sin(u_time))+freq*2.)*weight; 

    //定義圓環                         
    float dist = length(uv);
    float circle_dist = abs(dist-0.6+noise_2*.1);								//光環大小
    
    //定義星
    vec2 uv_flip= vec2(uv.x,-uv.y);
    float model_dist = abs(sdStar5(uv_flip,.5,.4));
    float model_dist_2= abs(sdHexagram( uv-.5-noise, .05)+noise);
    
    //動態呼吸
    //float breathing=sin(u_time*2.0*pi/4.0)*0.5+0.5;						//option1
    float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412; 			//option2 正確
    //float strength =(0.2*breathing*dir+0.180);			//[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
    float strength =(0.003*breathing+0.1);			//[0.2~0.3]			//光暈強度加上動態時間營造呼吸感
    float thickness=(0.001*breathing+0.06);			//[0.1~0.2]			//光環厚度 營造呼吸感
    float glow_circle = glow(circle_dist, strength, thickness);
    float glow_star= glow(model_dist, strength, thickness);
    float glow_star_2= glow(model_dist_2, strength, thickness);
    result+=glow_circle; 
    result_2=glow_star+glow_star_2;
        
    }
        
    gl_FragColor = vec4(vec3(result+info*.8)*vec3(sin(u_time/2.0*pi),0.694,0.436),1.0);
    //gl_FragColor = vec4(vec3(info),1.0);
    
}




/*
// Author:CMH
// Title:BreathingGlow+noise

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

vec2 hash2( vec2 x )            //亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                         mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}
#define Use_Perlin
//#define Use_Value
float noise( in vec2 p )        //亂數範圍 [-1,1]
{
#ifdef Use_Perlin    
return gnoise(p);   //gradient noise
#elif defined Use_Value
return vnoise(p);       //value noise
#endif    
return 0.0;
}
float fbm(in vec2 uv)       //亂數範圍 [-1,1]
{
    float f;                                                //fbm - fractal noise (4 octaves)
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f   = 0.5000*noise( uv ); uv = m*uv;          
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
    return f;
}


void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    uv= uv*2.0-1.0;
    
    //陰晴圓缺
    float pi=3.14159;
    float theta=2.0*pi*u_time/8.0;
    vec2 point=vec2(sin(theta), cos(theta));
    float dir= dot(point, (uv))+0.55;
    
    //亂數作用雲霧
    float fog= fbm(0.4*uv+vec2(-0.1*u_time, -0.02*u_time))*0.6+0.1;

    //定義圓環
    float dist = length(uv);
    float circle_dist = abs(dist-0.512);                                //光環大小
    
    //動態呼吸
    float breathing=sin(2.0*u_time/5.0*pi)*0.5+0.2;                     //option1
    //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;         //option2 錯誤
     //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;                //option2 正確
    float strength =(0.2*breathing+0.180);          //[0.2~0.3]         //光暈強度加上動態時間營造呼吸感
    float thickness=(0.1*breathing+0.084);          //[0.1~0.2]         //光環厚度 營造呼吸感
    float glow_circle = glow(circle_dist, strength, thickness);
    gl_FragColor = vec4((vec3(glow_circle)+fog)*dir*vec3(1.0, 0.5, 0.25),1.0);
}
*/







