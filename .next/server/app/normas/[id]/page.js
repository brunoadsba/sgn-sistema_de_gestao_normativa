(()=>{var a={};a.id=1629,a.ids=[1629],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},2659:(a,b,c)=>{"use strict";c.r(b),c.d(b,{GlobalError:()=>D.a,__next_app__:()=>J,handler:()=>L,pages:()=>I,routeModule:()=>K,tree:()=>H});var d=c(49754),e=c(9117),f=c(46595),g=c(32324),h=c(39326),i=c(38928),j=c(20175),k=c(12),l=c(54290),m=c(12696),n=c(82802),o=c(77533),p=c(45229),q=c(32822),r=c(261),s=c(26453),t=c(52474),u=c(26713),v=c(51356),w=c(62685),x=c(36225),y=c(63446),z=c(2762),A=c(45742),B=c(86439),C=c(81170),D=c.n(C),E=c(62506),F=c(91203),G={};for(let a in E)0>["default","tree","pages","GlobalError","__next_app__","routeModule","handler"].indexOf(a)&&(G[a]=()=>E[a]);c.d(b,G);let H={children:["",{children:["normas",{children:["[id]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(c.bind(c,48780)),"/home/brunoadsba/sgn/src/app/normas/[id]/page.tsx"]}]},{}]},{metadata:{icon:[async a=>(await Promise.resolve().then(c.bind(c,70440))).default(a)],apple:[],openGraph:[],twitter:[],manifest:"/manifest.webmanifest"}}]},{layout:[()=>Promise.resolve().then(c.bind(c,51472)),"/home/brunoadsba/sgn/src/app/layout.tsx"],loading:[()=>Promise.resolve().then(c.bind(c,48620)),"/home/brunoadsba/sgn/src/app/loading.tsx"],"global-error":[()=>Promise.resolve().then(c.t.bind(c,81170,23)),"next/dist/client/components/builtin/global-error.js"],"not-found":[()=>Promise.resolve().then(c.t.bind(c,87028,23)),"next/dist/client/components/builtin/not-found.js"],forbidden:[()=>Promise.resolve().then(c.t.bind(c,90461,23)),"next/dist/client/components/builtin/forbidden.js"],unauthorized:[()=>Promise.resolve().then(c.t.bind(c,32768,23)),"next/dist/client/components/builtin/unauthorized.js"],metadata:{icon:[async a=>(await Promise.resolve().then(c.bind(c,70440))).default(a)],apple:[],openGraph:[],twitter:[],manifest:"/manifest.webmanifest"}}]}.children,I=["/home/brunoadsba/sgn/src/app/normas/[id]/page.tsx"],J={require:c,loadChunk:()=>Promise.resolve()},K=new d.AppPageRouteModule({definition:{kind:e.RouteKind.APP_PAGE,page:"/normas/[id]/page",pathname:"/normas/[id]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:H},distDir:".next",relativeProjectDir:""});async function L(a,b,d){var C;let G="/normas/[id]/page";"/index"===G&&(G="/");let M=(0,h.getRequestMeta)(a,"postponed"),N=(0,h.getRequestMeta)(a,"minimalMode"),O=await K.prepare(a,b,{srcPage:G,multiZoneDraftMode:!1});if(!O)return b.statusCode=400,b.end("Bad Request"),null==d.waitUntil||d.waitUntil.call(d,Promise.resolve()),null;let{buildId:P,query:Q,params:R,parsedUrl:S,pageIsDynamic:T,buildManifest:U,nextFontManifest:V,reactLoadableManifest:W,serverActionsManifest:X,clientReferenceManifest:Y,subresourceIntegrityManifest:Z,prerenderManifest:$,isDraftMode:_,resolvedPathname:aa,revalidateOnlyGenerated:ab,routerServerContext:ac,nextConfig:ad,interceptionRoutePatterns:ae}=O,af=S.pathname||"/",ag=(0,r.normalizeAppPath)(G),{isOnDemandRevalidate:ah}=O,ai=K.match(af,$),aj=!!$.routes[aa],ak=!!(ai||aj||$.routes[ag]),al=a.headers["user-agent"]||"",am=(0,u.getBotType)(al),an=(0,p.isHtmlBotRequest)(a),ao=(0,h.getRequestMeta)(a,"isPrefetchRSCRequest")??"1"===a.headers[t.NEXT_ROUTER_PREFETCH_HEADER],ap=(0,h.getRequestMeta)(a,"isRSCRequest")??!!a.headers[t.RSC_HEADER],aq=(0,s.getIsPossibleServerAction)(a),ar=(0,m.checkIsAppPPREnabled)(ad.experimental.ppr)&&(null==(C=$.routes[ag]??$.dynamicRoutes[ag])?void 0:C.renderingMode)==="PARTIALLY_STATIC",as=!1,at=!1,au=ar?M:void 0,av=ar&&ap&&!ao,aw=(0,h.getRequestMeta)(a,"segmentPrefetchRSCRequest"),ax=!al||(0,p.shouldServeStreamingMetadata)(al,ad.htmlLimitedBots);an&&ar&&(ak=!1,ax=!1);let ay=!0===K.isDev||!ak||"string"==typeof M||av,az=an&&ar,aA=null;_||!ak||ay||aq||au||av||(aA=aa);let aB=aA;!aB&&K.isDev&&(aB=aa),K.isDev||_||!ak||!ap||av||(0,k.d)(a.headers);let aC={...E,tree:H,pages:I,GlobalError:D(),handler:L,routeModule:K,__next_app__:J};X&&Y&&(0,o.setReferenceManifestsSingleton)({page:G,clientReferenceManifest:Y,serverActionsManifest:X,serverModuleMap:(0,q.createServerModuleMap)({serverActionsManifest:X})});let aD=a.method||"GET",aE=(0,g.getTracer)(),aF=aE.getActiveScopeSpan();try{let f=K.getVaryHeader(aa,ae);b.setHeader("Vary",f);let k=async(c,d)=>{let e=new l.NodeNextRequest(a),f=new l.NodeNextResponse(b);return K.render(e,f,d).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=aE.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==i.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${aD} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${aD} ${a.url}`)})},m=async({span:e,postponed:f,fallbackRouteParams:g})=>{let i={query:Q,params:R,page:ag,sharedContext:{buildId:P},serverComponentsHmrCache:(0,h.getRequestMeta)(a,"serverComponentsHmrCache"),fallbackRouteParams:g,renderOpts:{App:()=>null,Document:()=>null,pageConfig:{},ComponentMod:aC,Component:(0,j.T)(aC),params:R,routeModule:K,page:G,postponed:f,shouldWaitOnAllReady:az,serveStreamingMetadata:ax,supportsDynamicResponse:"string"==typeof f||ay,buildManifest:U,nextFontManifest:V,reactLoadableManifest:W,subresourceIntegrityManifest:Z,serverActionsManifest:X,clientReferenceManifest:Y,setIsrStatus:null==ac?void 0:ac.setIsrStatus,dir:c(33873).join(process.cwd(),K.relativeProjectDir),isDraftMode:_,isRevalidate:ak&&!f&&!av,botType:am,isOnDemandRevalidate:ah,isPossibleServerAction:aq,assetPrefix:ad.assetPrefix,nextConfigOutput:ad.output,crossOrigin:ad.crossOrigin,trailingSlash:ad.trailingSlash,previewProps:$.preview,deploymentId:ad.deploymentId,enableTainting:ad.experimental.taint,htmlLimitedBots:ad.htmlLimitedBots,devtoolSegmentExplorer:ad.experimental.devtoolSegmentExplorer,reactMaxHeadersLength:ad.reactMaxHeadersLength,multiZoneDraftMode:!1,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:ad.experimental.cacheLife,basePath:ad.basePath,serverActions:ad.experimental.serverActions,...as?{nextExport:!0,supportsDynamicResponse:!1,isStaticGeneration:!0,isRevalidate:!0,isDebugDynamicAccesses:as}:{},experimental:{isRoutePPREnabled:ar,expireTime:ad.expireTime,staleTimes:ad.experimental.staleTimes,cacheComponents:!!ad.experimental.cacheComponents,clientSegmentCache:!!ad.experimental.clientSegmentCache,clientParamParsing:!!ad.experimental.clientParamParsing,dynamicOnHover:!!ad.experimental.dynamicOnHover,inlineCss:!!ad.experimental.inlineCss,authInterrupts:!!ad.experimental.authInterrupts,clientTraceMetadata:ad.experimental.clientTraceMetadata||[]},waitUntil:d.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:()=>{},onInstrumentationRequestError:(b,c,d)=>K.onRequestError(a,b,d,ac),err:(0,h.getRequestMeta)(a,"invokeError"),dev:K.isDev}},l=await k(e,i),{metadata:m}=l,{cacheControl:n,headers:o={},fetchTags:p}=m;if(p&&(o[y.NEXT_CACHE_TAGS_HEADER]=p),a.fetchMetrics=m.fetchMetrics,ak&&(null==n?void 0:n.revalidate)===0&&!K.isDev&&!ar){let a=m.staticBailoutInfo,b=Object.defineProperty(Error(`Page changed from static to dynamic at runtime ${aa}${(null==a?void 0:a.description)?`, reason: ${a.description}`:""}
see more here https://nextjs.org/docs/messages/app-static-to-dynamic-error`),"__NEXT_ERROR_CODE",{value:"E132",enumerable:!1,configurable:!0});if(null==a?void 0:a.stack){let c=a.stack;b.stack=b.message+c.substring(c.indexOf("\n"))}throw b}return{value:{kind:v.CachedRouteKind.APP_PAGE,html:l,headers:o,rscData:m.flightData,postponed:m.postponed,status:m.statusCode,segmentData:m.segmentData},cacheControl:n}},o=async({hasResolved:c,previousCacheEntry:f,isRevalidating:g,span:i})=>{let j,k=!1===K.isDev,l=c||b.writableEnded;if(ah&&ab&&!f&&!N)return(null==ac?void 0:ac.render404)?await ac.render404(a,b):(b.statusCode=404,b.end("This page could not be found")),null;if(ai&&(j=(0,w.parseFallbackField)(ai.fallback)),j===w.FallbackMode.PRERENDER&&(0,u.isBot)(al)&&(!ar||an)&&(j=w.FallbackMode.BLOCKING_STATIC_RENDER),(null==f?void 0:f.isStale)===-1&&(ah=!0),ah&&(j!==w.FallbackMode.NOT_FOUND||f)&&(j=w.FallbackMode.BLOCKING_STATIC_RENDER),!N&&j!==w.FallbackMode.BLOCKING_STATIC_RENDER&&aB&&!l&&!_&&T&&(k||!aj)){let b;if((k||ai)&&j===w.FallbackMode.NOT_FOUND)throw new B.NoFallbackError;if(ar&&!ap){let c="string"==typeof(null==ai?void 0:ai.fallback)?ai.fallback:k?ag:null;if(b=await K.handleResponse({cacheKey:c,req:a,nextConfig:ad,routeKind:e.RouteKind.APP_PAGE,isFallback:!0,prerenderManifest:$,isRoutePPREnabled:ar,responseGenerator:async()=>m({span:i,postponed:void 0,fallbackRouteParams:k||at?(0,n.u)(ag):null}),waitUntil:d.waitUntil}),null===b)return null;if(b)return delete b.cacheControl,b}}let o=ah||g||!au?void 0:au;if(as&&void 0!==o)return{cacheControl:{revalidate:1,expire:void 0},value:{kind:v.CachedRouteKind.PAGES,html:x.default.EMPTY,pageData:{},headers:void 0,status:void 0}};let p=T&&ar&&((0,h.getRequestMeta)(a,"renderFallbackShell")||at)?(0,n.u)(af):null;return m({span:i,postponed:o,fallbackRouteParams:p})},p=async c=>{var f,g,i,j,k;let l,n=await K.handleResponse({cacheKey:aA,responseGenerator:a=>o({span:c,...a}),routeKind:e.RouteKind.APP_PAGE,isOnDemandRevalidate:ah,isRoutePPREnabled:ar,req:a,nextConfig:ad,prerenderManifest:$,waitUntil:d.waitUntil});if(_&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate"),K.isDev&&b.setHeader("Cache-Control","no-store, must-revalidate"),!n){if(aA)throw Object.defineProperty(Error("invariant: cache entry required but not generated"),"__NEXT_ERROR_CODE",{value:"E62",enumerable:!1,configurable:!0});return null}if((null==(f=n.value)?void 0:f.kind)!==v.CachedRouteKind.APP_PAGE)throw Object.defineProperty(Error(`Invariant app-page handler received invalid cache entry ${null==(i=n.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E707",enumerable:!1,configurable:!0});let p="string"==typeof n.value.postponed;ak&&!av&&(!p||ao)&&(N||b.setHeader("x-nextjs-cache",ah?"REVALIDATED":n.isMiss?"MISS":n.isStale?"STALE":"HIT"),b.setHeader(t.NEXT_IS_PRERENDER_HEADER,"1"));let{value:q}=n;if(au)l={revalidate:0,expire:void 0};else if(N&&ap&&!ao&&ar)l={revalidate:0,expire:void 0};else if(!K.isDev)if(_)l={revalidate:0,expire:void 0};else if(ak){if(n.cacheControl)if("number"==typeof n.cacheControl.revalidate){if(n.cacheControl.revalidate<1)throw Object.defineProperty(Error(`Invalid revalidate configuration provided: ${n.cacheControl.revalidate} < 1`),"__NEXT_ERROR_CODE",{value:"E22",enumerable:!1,configurable:!0});l={revalidate:n.cacheControl.revalidate,expire:(null==(j=n.cacheControl)?void 0:j.expire)??ad.expireTime}}else l={revalidate:y.CACHE_ONE_YEAR,expire:void 0}}else b.getHeader("Cache-Control")||(l={revalidate:0,expire:void 0});if(n.cacheControl=l,"string"==typeof aw&&(null==q?void 0:q.kind)===v.CachedRouteKind.APP_PAGE&&q.segmentData){b.setHeader(t.NEXT_DID_POSTPONE_HEADER,"2");let c=null==(k=q.headers)?void 0:k[y.NEXT_CACHE_TAGS_HEADER];N&&ak&&c&&"string"==typeof c&&b.setHeader(y.NEXT_CACHE_TAGS_HEADER,c);let d=q.segmentData.get(aw);return void 0!==d?(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:x.default.fromStatic(d,t.RSC_CONTENT_TYPE_HEADER),cacheControl:n.cacheControl}):(b.statusCode=204,(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:x.default.EMPTY,cacheControl:n.cacheControl}))}let r=(0,h.getRequestMeta)(a,"onCacheEntry");if(r&&await r({...n,value:{...n.value,kind:"PAGE"}},{url:(0,h.getRequestMeta)(a,"initURL")}))return null;if(p&&au)throw Object.defineProperty(Error("Invariant: postponed state should not be present on a resume request"),"__NEXT_ERROR_CODE",{value:"E396",enumerable:!1,configurable:!0});if(q.headers){let a={...q.headers};for(let[c,d]of(N&&ak||delete a[y.NEXT_CACHE_TAGS_HEADER],Object.entries(a)))if(void 0!==d)if(Array.isArray(d))for(let a of d)b.appendHeader(c,a);else"number"==typeof d&&(d=d.toString()),b.appendHeader(c,d)}let s=null==(g=q.headers)?void 0:g[y.NEXT_CACHE_TAGS_HEADER];if(N&&ak&&s&&"string"==typeof s&&b.setHeader(y.NEXT_CACHE_TAGS_HEADER,s),!q.status||ap&&ar||(b.statusCode=q.status),!N&&q.status&&F.RedirectStatusCode[q.status]&&ap&&(b.statusCode=200),p&&b.setHeader(t.NEXT_DID_POSTPONE_HEADER,"1"),ap&&!_){if(void 0===q.rscData){if(q.postponed)throw Object.defineProperty(Error("Invariant: Expected postponed to be undefined"),"__NEXT_ERROR_CODE",{value:"E372",enumerable:!1,configurable:!0});return(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:q.html,cacheControl:av?{revalidate:0,expire:void 0}:n.cacheControl})}return(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:x.default.fromStatic(q.rscData,t.RSC_CONTENT_TYPE_HEADER),cacheControl:n.cacheControl})}let u=q.html;if(!p||N||ap)return(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:u,cacheControl:n.cacheControl});if(as)return u.push(new ReadableStream({start(a){a.enqueue(z.ENCODED_TAGS.CLOSED.BODY_AND_HTML),a.close()}})),(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:u,cacheControl:{revalidate:0,expire:void 0}});let w=new TransformStream;return u.push(w.readable),m({span:c,postponed:q.postponed,fallbackRouteParams:null}).then(async a=>{var b,c;if(!a)throw Object.defineProperty(Error("Invariant: expected a result to be returned"),"__NEXT_ERROR_CODE",{value:"E463",enumerable:!1,configurable:!0});if((null==(b=a.value)?void 0:b.kind)!==v.CachedRouteKind.APP_PAGE)throw Object.defineProperty(Error(`Invariant: expected a page response, got ${null==(c=a.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E305",enumerable:!1,configurable:!0});await a.value.html.pipeTo(w.writable)}).catch(a=>{w.writable.abort(a).catch(a=>{console.error("couldn't abort transformer",a)})}),(0,A.sendRenderResult)({req:a,res:b,generateEtags:ad.generateEtags,poweredByHeader:ad.poweredByHeader,result:u,cacheControl:{revalidate:0,expire:void 0}})};if(!aF)return await aE.withPropagatedContext(a.headers,()=>aE.trace(i.BaseServerSpan.handleRequest,{spanName:`${aD} ${a.url}`,kind:g.SpanKind.SERVER,attributes:{"http.method":aD,"http.target":a.url}},p));await p(aF)}catch(b){throw aF||b instanceof B.NoFallbackError||await K.onRequestError(a,b,{routerKind:"App Router",routePath:G,routeType:"render",revalidateReason:(0,f.c)({isRevalidate:ak,isOnDemandRevalidate:ah})},ac),b}}},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3663:(a,b,c)=>{"use strict";c.d(b,{A:()=>d});let d=(0,c(23339).A)("file-text",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]])},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},23339:(a,b,c)=>{"use strict";c.d(b,{A:()=>i});var d=c(38301);let e=a=>{let b=a.replace(/^([A-Z])|[\s-_]+(\w)/g,(a,b,c)=>c?c.toUpperCase():b.toLowerCase());return b.charAt(0).toUpperCase()+b.slice(1)},f=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var g={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let h=(0,d.forwardRef)(({color:a="currentColor",size:b=24,strokeWidth:c=2,absoluteStrokeWidth:e,className:h="",children:i,iconNode:j,...k},l)=>(0,d.createElement)("svg",{ref:l,...g,width:b,height:b,stroke:a,strokeWidth:e?24*Number(c)/Number(b):c,className:f("lucide",h),...!i&&!(a=>{for(let b in a)if(b.startsWith("aria-")||"role"===b||"title"===b)return!0})(k)&&{"aria-hidden":"true"},...k},[...j.map(([a,b])=>(0,d.createElement)(a,b)),...Array.isArray(i)?i:[i]])),i=(a,b)=>{let c=(0,d.forwardRef)(({className:c,...g},i)=>(0,d.createElement)(h,{ref:i,iconNode:b,className:f(`lucide-${e(a).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${a}`,c),...g}));return c.displayName=e(a),c}},26691:(a,b,c)=>{"use strict";c.d(b,{F:()=>g});var d=c(43249);let e=a=>"boolean"==typeof a?`${a}`:0===a?"0":a,f=d.$,g=(a,b)=>c=>{var d;if((null==b?void 0:b.variants)==null)return f(a,null==c?void 0:c.class,null==c?void 0:c.className);let{variants:g,defaultVariants:h}=b,i=Object.keys(g).map(a=>{let b=null==c?void 0:c[a],d=null==h?void 0:h[a];if(null===b)return null;let f=e(b)||e(d);return g[a][f]}),j=c&&Object.entries(c).reduce((a,b)=>{let[c,d]=b;return void 0===d||(a[c]=d),a},{});return f(a,i,null==b||null==(d=b.compoundVariants)?void 0:d.reduce((a,b)=>{let{class:c,className:d,...e}=b;return Object.entries(e).every(a=>{let[b,c]=a;return Array.isArray(c)?c.includes({...h,...j}[b]):({...h,...j})[b]===c})?[...a,c,d]:a},[]),null==c?void 0:c.class,null==c?void 0:c.className)}},26713:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/is-bot")},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},35284:(a,b,c)=>{"use strict";c.d(b,{$:()=>j});var d=c(21124),e=c(38301),f=c(96425),g=c(26691),h=c(44943);let i=(0,g.F)("inline-flex items-center justify-center whitespace-nowrap rounded-sgn-md text-sgn-sm font-sgn-medium ring-offset-background transition-all duration-sgn-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-sgn-primary-500 text-white shadow-sgn-sm hover:bg-sgn-primary-600 hover:shadow-sgn-md active:bg-sgn-primary-700",destructive:"bg-sgn-danger-500 text-white shadow-sgn-sm hover:bg-sgn-danger-600 hover:shadow-sgn-md active:bg-sgn-danger-700",outline:"border border-sgn-primary-200 bg-background shadow-sgn-sm hover:bg-sgn-primary-50 hover:text-sgn-primary-600 hover:border-sgn-primary-300",secondary:"bg-sgn-primary-100 text-sgn-primary-700 shadow-sgn-sm hover:bg-sgn-primary-200 hover:shadow-sgn-md",ghost:"hover:bg-sgn-primary-50 hover:text-sgn-primary-600",link:"text-sgn-primary-500 underline-offset-4 hover:underline hover:text-sgn-primary-600",success:"bg-sgn-success-500 text-white shadow-sgn-sm hover:bg-sgn-success-600 hover:shadow-sgn-md active:bg-sgn-success-700",warning:"bg-sgn-warning-500 text-white shadow-sgn-sm hover:bg-sgn-warning-600 hover:shadow-sgn-md active:bg-sgn-warning-700"},size:{default:"h-10 px-sgn-md py-sgn-sm",sm:"h-9 rounded-sgn-sm px-sgn-sm text-sgn-xs",lg:"h-11 rounded-sgn-lg px-sgn-lg text-sgn-base",xl:"h-12 rounded-sgn-lg px-sgn-xl text-sgn-lg",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),j=e.forwardRef(({className:a,variant:b,size:c,asChild:e=!1,loading:g=!1,children:j,disabled:k,...l},m)=>{let n=e?f.DX:"button";return(0,d.jsxs)(n,{className:(0,h.cn)(i({variant:b,size:c,className:a})),ref:m,disabled:k||g,...l,children:[g&&(0,d.jsxs)("svg",{className:"mr-sgn-sm h-sgn-sm w-sgn-sm animate-spin",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,d.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,d.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),j]})});j.displayName="Button"},40165:(a,b,c)=>{"use strict";c.d(b,{default:()=>r});var d=c(21124),e=c(35284),f=c(38301);let g=0,h=new Map,i=a=>{if(h.has(a))return;let b=setTimeout(()=>{h.delete(a),l({type:"REMOVE_TOAST",toastId:a})},1e6);h.set(a,b)},j=[],k={toasts:[]};function l(a){k=((a,b)=>{switch(b.type){case"ADD_TOAST":return{...a,toasts:[b.toast,...a.toasts].slice(0,1)};case"UPDATE_TOAST":return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case"DISMISS_TOAST":{let{toastId:c}=b;return c?i(c):a.toasts.forEach(a=>{i(a.id)}),{...a,toasts:a.toasts.map(a=>a.id===c||void 0===c?{...a,open:!1}:a)}}case"REMOVE_TOAST":if(void 0===b.toastId)return{...a,toasts:[]};return{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)}}})(k,a),j.forEach(a=>{a(k)})}function m({...a}){let b=(g=(g+1)%Number.MAX_SAFE_INTEGER).toString(),c=()=>l({type:"DISMISS_TOAST",toastId:b});return l({type:"ADD_TOAST",toast:{...a,id:b,open:!0,onOpenChange:a=>{a||c()}}}),{id:b,dismiss:c,update:a=>l({type:"UPDATE_TOAST",toast:{...a,id:b}})}}var n=c(3663);let o=(0,c(23339).A)("hard-hat",[["path",{d:"M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5",key:"1p9q5i"}],["path",{d:"M14 6a6 6 0 0 1 6 6v3",key:"1hnv84"}],["path",{d:"M4 15v-3a6 6 0 0 1 6-6",key:"9ciidu"}],["rect",{x:"2",y:"15",width:"20",height:"4",rx:"1",key:"g3x8cw"}]]);var p=c(75219),q=c(68324);function r({norma:a}){let{toast:b}=function(){let[a,b]=f.useState(k);return f.useEffect(()=>(j.push(b),()=>{let a=j.indexOf(b);a>-1&&j.splice(a,1)}),[a]),{...a,toast:m,dismiss:a=>l({type:"DISMISS_TOAST",toastId:a})}}(),[c,g]=(0,f.useState)(!1),[h,i]=(0,f.useState)(!1),r=async()=>{g(!0);try{let c=(()=>{let b=a.titulo.includes("REVOGADA"),c=a.titulo.includes("SEGURAN\xc7A")?"Seguran\xe7a do Trabalho":a.titulo.includes("SA\xdaDE")?"Sa\xfade Ocupacional":a.titulo.includes("EQUIPAMENTO")?"Equipamentos de Prote\xe7\xe3o Individual":a.titulo.includes("CONSTRU\xc7\xc3O")?"Seguran\xe7a na Constru\xe7\xe3o Civil":a.titulo.includes("RURAL")?"Seguran\xe7a no Trabalho Rural":"Disposi\xe7\xf5es Gerais de Seguran\xe7a",d="",e="",f="M\xc9DIO";switch(a.codigo.match(/NR-(\\d+)/)?.[1]){case"1":d="Aplic\xe1vel a todas as empresas e empregadores que admitam trabalhadores",e="Fundamental para PGR e PCMSO. Base para todas as demais NRs.";break;case"6":d="Empresas que utilizam equipamentos de prote\xe7\xe3o individual",e="Obrigat\xf3rio CA dos EPIs. Treinamento e fiscaliza\xe7\xe3o necess\xe1rios.";break;case"12":d="Ind\xfastrias e empresas que operam m\xe1quinas e equipamentos",e="Dispositivos de seguran\xe7a obrigat\xf3rios. Manuten\xe7\xe3o preventiva essencial.",f="ALTO";break;case"18":d="Constru\xe7\xe3o civil, obras de edifica\xe7\xe3o, demoli\xe7\xe3o e reparo",e="PCMAT obrigat\xf3rio para obras com 20+ trabalhadores. DDS di\xe1rio.",f="ALTO";break;case"35":d="Atividades e servi\xe7os envolvendo altura superior a 2 metros",e="An\xe1lise de Risco obrigat\xf3ria. Sistema de ancoragem certificado.",f="ALTO";break;default:d="Conforme especifica\xe7\xf5es t\xe9cnicas da norma",e="Consulte o texto integral para requisitos espec\xedficos."}return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relat\xf3rio T\xe9cnico - ${a.codigo}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #64748b;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
            margin-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
        }
        .status-ativo {
            color: #16a34a;
            font-weight: bold;
        }
        .status-revogado {
            color: #dc2626;
            font-weight: bold;
        }
        .alert-box {
            background-color: ${b?"#fef2f2":"#f0f9ff"};
            border: 2px solid ${b?"#dc2626":"#2563eb"};
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .alert-title {
            font-weight: bold;
            color: ${b?"#dc2626":"#1e40af"};
            margin-bottom: 8px;
        }
        .recommendations {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .recommendations ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .footer {
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 40px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        .criticidade-alto {
            color: #dc2626;
            font-weight: bold;
        }
        .criticidade-medio {
            color: #ea580c;
            font-weight: bold;
        }
        @media print {
            body { margin: 20px; }
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">RELAT\xd3RIO T\xc9CNICO DE SEGURAN\xc7A DO TRABALHO</div>
        <div class="subtitle">Sistema de Gest\xe3o Normativa (SGN)</div>
    </div>

    <div class="section">
        <div class="section-title">📋 IDENTIFICA\xc7\xc3O DA NORMA</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">C\xf3digo</div>
                <div>${a.codigo}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Status Legal</div>
                <div class="${b?"status-revogado":"status-ativo"}">
                    ${b?"⚠️ REVOGADA - SEM VALIDADE LEGAL":"✅ VIGENTE"}
                </div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">T\xedtulo</div>
            <div>${a.titulo}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🏛️ DADOS REGULAMENTARES</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">\xd3rg\xe3o Expedidor</div>
                <div>${a.orgao_publicador}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Categoria</div>
                <div>${c}</div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Data de Inclus\xe3o no Sistema</div>
            <div>${new Date(a.created_at).toLocaleDateString("pt-BR")}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🎯 AN\xc1LISE T\xc9CNICA</div>
        <div class="info-item">
            <div class="info-label">Aplicabilidade</div>
            <div>${d}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Observa\xe7\xf5es T\xe9cnicas</div>
            <div>${e}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📊 AVALIA\xc7\xc3O DE RISCO</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">N\xedvel de Criticidade</div>
                <div class="${"ALTO"===f?"criticidade-alto":"criticidade-medio"}">
                    ${f}
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">\xc1rea de Atua\xe7\xe3o</div>
                <div>${c}</div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Fiscaliza\xe7\xe3o</div>
            <div>Sujeita \xe0 autua\xe7\xe3o pelo Minist\xe9rio do Trabalho e Emprego</div>
        </div>
    </div>

    ${b?`
    <div class="alert-box">
        <div class="alert-title">🚨 ALERTA REGULAMENT\xc1RIO</div>
        <p>Esta norma foi REVOGADA e n\xe3o possui mais validade legal. \xc9 necess\xe1rio verificar a norma substituta ou regulamenta\xe7\xe3o atual. <strong>USO APENAS PARA CONSULTA HIST\xd3RICA.</strong></p>
    </div>
    `:`
    <div class="alert-box">
        <div class="alert-title">✅ CONFORMIDADE LEGAL</div>
        <p>Esta norma est\xe1 em vigor e deve ser cumprida conforme determina a legisla\xe7\xe3o trabalhista brasileira.</p>
    </div>
    `}

    <div class="section">
        <div class="section-title">📝 RECOMENDA\xc7\xd5ES PROFISSIONAIS</div>
        <div class="recommendations">
            <ol>
                <li>Consulte o texto integral da norma no site oficial do Minist\xe9rio do Trabalho</li>
                <li>Implemente os requisitos conforme cronograma estabelecido</li>
                <li>Documente todas as a\xe7\xf5es de adequa\xe7\xe3o</li>
                <li>Mantenha treinamentos atualizados</li>
                <li>Realize auditorias internas peri\xf3dicas</li>
                <li>Monitore atualiza\xe7\xf5es regulamentares</li>
            </ol>
        </div>
    </div>

    <div class="footer">
        <p><strong>Relat\xf3rio gerado em:</strong> ${new Date().toLocaleDateString("pt-BR")} \xe0s ${new Date().toLocaleTimeString("pt-BR")}</p>
        <p><strong>Respons\xe1vel T\xe9cnico:</strong> Engenheiro/T\xe9cnico de Seguran\xe7a do Trabalho</p>
        <p><strong>Fonte:</strong> Sistema de Gest\xe3o Normativa (SGN)</p>
        <p><strong>URL de refer\xeancia:</strong> </p>
        <br>
        <p><em>IMPORTANTE: Este relat\xf3rio \xe9 uma ferramenta de apoio t\xe9cnico. Consulte sempre o texto oficial da norma para implementa\xe7\xe3o.</em></p>
    </div>
</body>
</html>`})(),d=window.open("","_blank");d&&(d.document.write(c),d.document.close(),setTimeout(()=>{d.focus(),d.print()},500)),b({title:"Relat\xf3rio T\xe9cnico Gerado",description:"Use Ctrl+P ou Cmd+P para salvar como PDF na janela que se abriu."})}catch{b({title:"Erro na Exporta\xe7\xe3o",description:"N\xe3o foi poss\xedvel gerar o relat\xf3rio t\xe9cnico.",variant:"destructive"})}finally{g(!1)}},s=async()=>{i(!0);try{let c=a.titulo.includes("REVOGADA"),d=`🛡️ NORMA REGULAMENTADORA DE SEGURAN\xc7A DO TRABALHO

📋 ${a.codigo} - ${a.titulo}

🏛️ \xd3rg\xe3o: ${a.orgao_publicador}
📊 Status: ${c?"⚠️":"✅"} ${c?"REVOGADA":"VIGENTE"}
📅 Sistema SGN: ${new Date(a.created_at).toLocaleDateString("pt-BR")}

${c?"⚠️ ATEN\xc7\xc3O: Esta norma foi revogada e n\xe3o possui validade legal. Verificar norma substituta.":"✅ Esta norma est\xe1 em vigor e deve ser observada para conformidade legal."}

🔗 Consulte detalhes: 

#Seguran\xe7aDoTrabalho #NR #Conformidade #SST
───────────────────────────────
📱 Compartilhado via SGN - Sistema de Gest\xe3o Normativa`;"undefined"!=typeof navigator&&navigator.share?await navigator.share({title:`${a.codigo} - Norma de Seguran\xe7a do Trabalho`,text:d,url:window.location.href}):"undefined"!=typeof navigator&&navigator.clipboard&&(await navigator.clipboard.writeText(d),b({title:"Informa\xe7\xf5es Copiadas",description:"Dados t\xe9cnicos da norma copiados para \xe1rea de transfer\xeancia."}))}catch{try{"undefined"!=typeof navigator&&navigator.clipboard&&(await navigator.clipboard.writeText(window.location.href),b({title:"URL Copiada",description:"Link da norma copiado para compartilhamento."}))}catch{b({title:"Erro no Compartilhamento",description:"N\xe3o foi poss\xedvel compartilhar. Copie a URL manualmente.",variant:"destructive"})}}finally{i(!1)}};return(0,d.jsxs)("div",{className:"space-y-4",children:[(0,d.jsxs)("div",{className:"flex gap-3 pt-4 border-t",children:[(0,d.jsx)(e.$,{variant:"outline",className:"flex-1 transition-all hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",onClick:r,disabled:c,children:c?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.A,{className:"h-4 w-4 animate-pulse"}),"Gerando Relat\xf3rio..."]}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(o,{className:"h-4 w-4"}),"Relat\xf3rio T\xe9cnico"]})}),(0,d.jsx)(e.$,{variant:"outline",className:"flex-1 transition-all hover:bg-green-50 hover:border-green-300 hover:text-green-700",onClick:s,disabled:h,children:h?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(p.A,{className:"h-4 w-4 animate-pulse"}),"Compartilhando..."]}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(q.A,{className:"h-4 w-4"}),"Compartilhar SST"]})})]}),(0,d.jsxs)("div",{className:"text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border",children:[(0,d.jsx)("p",{className:"font-medium mb-1",children:"\uD83D\uDCA1 Para Profissionais de Seguran\xe7a:"}),(0,d.jsxs)("p",{children:["• ",(0,d.jsx)("strong",{children:"Relat\xf3rio T\xe9cnico"}),": Gera relat\xf3rio profissional em PDF para documenta\xe7\xe3o oficial"]}),(0,d.jsxs)("p",{children:["• ",(0,d.jsx)("strong",{children:"Compartilhar SST"}),": Formato espec\xedfico para equipes de seguran\xe7a do trabalho"]})]})]})}},41025:a=>{"use strict";a.exports=require("next/dist/server/app-render/dynamic-access-async-storage.external.js")},44391:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,65169,23)),Promise.resolve().then(c.bind(c,99473))},48780:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>n});var d=c(75338),e=c(52446),f=c(67480),g=c(19149),h=c(65169),i=c.n(h);let j=(0,c(4290).A)("triangle-alert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);var k=c(88273),l=c(99473);async function m(a){try{let b=await fetch(`http://localhost:3001/api/normas/${a}`,{cache:"no-store"});if(!b.ok)return{success:!1,data:null};return await b.json()}catch(a){return console.error("Erro ao buscar norma:",a),{success:!1,data:null}}}async function n({params:a}){let b=(await a).id,c=await m(b);if(!c.success||!c.data)return(0,d.jsx)("div",{className:"min-h-screen bg-background p-8",children:(0,d.jsxs)("div",{className:"max-w-4xl mx-auto",children:[(0,d.jsx)("h1",{className:"text-2xl font-bold text-red-600",children:"Norma n\xe3o encontrada"}),(0,d.jsxs)("p",{className:"text-muted-foreground mt-2",children:["ID solicitado: ",b]}),(0,d.jsx)(i(),{href:"/normas",children:(0,d.jsx)(e.$,{variant:"outline",className:"mt-4",children:"Voltar para lista"})})]})});let h=c.data,n=h.titulo.includes("REVOGADA");return(0,d.jsx)("div",{className:"min-h-screen bg-background p-8",children:(0,d.jsxs)("div",{className:"max-w-4xl mx-auto",children:[(0,d.jsx)("div",{className:"mb-6",children:(0,d.jsx)(i(),{href:"/normas",children:(0,d.jsx)(e.$,{variant:"outline",children:"← Voltar para lista"})})}),(0,d.jsx)(f.Zp,{children:(0,d.jsxs)(f.Wu,{className:"p-8",children:[(0,d.jsxs)("div",{className:"space-y-6",children:[(0,d.jsxs)("div",{children:[(0,d.jsx)("div",{className:"flex items-center justify-between mb-4",children:(0,d.jsxs)("div",{className:"flex items-center space-x-3",children:[(0,d.jsx)("h1",{className:"text-3xl font-bold text-gray-900",children:h.codigo.split(" - ")[0]}),n?(0,d.jsxs)(g.E,{variant:"destructive",className:"flex items-center gap-1",children:[(0,d.jsx)(j,{className:"h-3 w-3"}),"Revogada"]}):(0,d.jsxs)(g.E,{className:"bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1",children:[(0,d.jsx)(k.A,{className:"h-3 w-3"}),"Em Vigor"]})]})}),(0,d.jsx)("h2",{className:"text-xl text-gray-700 mb-6 leading-relaxed",children:h.titulo})]}),(0,d.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-8",children:[(0,d.jsxs)("div",{children:[(0,d.jsx)("h3",{className:"font-semibold text-base mb-2",children:"\xd3rg\xe3o Respons\xe1vel"}),(0,d.jsx)("p",{className:"text-muted-foreground",children:h.orgao_publicador})]}),(0,d.jsxs)("div",{children:[(0,d.jsx)("h3",{className:"font-semibold text-base mb-2",children:"Status Legal"}),(0,d.jsx)("p",{className:"text-muted-foreground",children:n?"Norma revogada - sem validade legal":"Norma ativa e em vigor"})]})]}),(0,d.jsxs)("div",{className:"space-y-4",children:[(0,d.jsxs)("div",{children:[(0,d.jsx)("h3",{className:"font-semibold text-base mb-2",children:"Adicionada ao Sistema"}),(0,d.jsx)("p",{className:"text-muted-foreground",children:new Date(h.created_at).toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"})})]}),(0,d.jsxs)("div",{children:[(0,d.jsx)("h3",{className:"font-semibold text-base mb-2",children:"Categoria de Seguran\xe7a"}),(0,d.jsx)("p",{className:"text-muted-foreground",children:h.titulo.includes("SEGURAN\xc7A")?"Seguran\xe7a do Trabalho":h.titulo.includes("SA\xdaDE")?"Sa\xfade Ocupacional":h.titulo.includes("EQUIPAMENTO")?"Equipamentos de Prote\xe7\xe3o Individual":h.titulo.includes("CONSTRU\xc7\xc3O")?"Seguran\xe7a na Constru\xe7\xe3o Civil":h.titulo.includes("RURAL")?"Seguran\xe7a no Trabalho Rural":"Disposi\xe7\xf5es Gerais de Seguran\xe7a"})]})]})]}),n&&(0,d.jsxs)("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4 mt-6",children:[(0,d.jsxs)("h4",{className:"font-semibold text-red-800 mb-2 flex items-center gap-2",children:[(0,d.jsx)(j,{className:"h-4 w-4"}),"Norma Revogada - Aten\xe7\xe3o Profissional"]}),(0,d.jsxs)("p",{className:"text-red-700 text-sm",children:["Esta norma regulamentadora foi ",(0,d.jsx)("strong",{children:"revogada"})," e n\xe3o possui mais validade legal. Para conformidade com a legisla\xe7\xe3o de seguran\xe7a do trabalho, consulte a legisla\xe7\xe3o atual para verificar a norma que a substituiu. ",(0,d.jsx)("strong",{children:"N\xe3o utilize para implementa\xe7\xe3o."})]})]}),(0,d.jsx)(l.default,{norma:h})]})})]})})}},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},68324:(a,b,c)=>{"use strict";c.d(b,{A:()=>d});let d=(0,c(23339).A)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]])},74655:(a,b,c)=>{Promise.resolve().then(c.t.bind(c,3991,23)),Promise.resolve().then(c.bind(c,40165))},75219:(a,b,c)=>{"use strict";c.d(b,{A:()=>d});let d=(0,c(23339).A)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},88273:(a,b,c)=>{"use strict";c.d(b,{A:()=>d});let d=(0,c(4290).A)("circle-check-big",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]])},92808:(a,b,c)=>{"use strict";c.d(b,{s:()=>g,t:()=>f});var d=c(38301);function e(a,b){if("function"==typeof a)return a(b);null!=a&&(a.current=b)}function f(...a){return b=>{let c=!1,d=a.map(a=>{let d=e(a,b);return c||"function"!=typeof d||(c=!0),d});if(c)return()=>{for(let b=0;b<d.length;b++){let c=d[b];"function"==typeof c?c():e(a[b],null)}}}}function g(...a){return d.useCallback(f(...a),a)}},96425:(a,b,c)=>{"use strict";c.d(b,{DX:()=>h,TL:()=>g});var d=c(38301),e=c(92808),f=c(21124);function g(a){let b=function(a){let b=d.forwardRef((a,b)=>{let{children:c,...f}=a;if(d.isValidElement(c)){var g;let a,h,i=(g=c,(h=(a=Object.getOwnPropertyDescriptor(g.props,"ref")?.get)&&"isReactWarning"in a&&a.isReactWarning)?g.ref:(h=(a=Object.getOwnPropertyDescriptor(g,"ref")?.get)&&"isReactWarning"in a&&a.isReactWarning)?g.props.ref:g.props.ref||g.ref),j=function(a,b){let c={...b};for(let d in b){let e=a[d],f=b[d];/^on[A-Z]/.test(d)?e&&f?c[d]=(...a)=>{let b=f(...a);return e(...a),b}:e&&(c[d]=e):"style"===d?c[d]={...e,...f}:"className"===d&&(c[d]=[e,f].filter(Boolean).join(" "))}return{...a,...c}}(f,c.props);return c.type!==d.Fragment&&(j.ref=b?(0,e.t)(b,i):i),d.cloneElement(c,j)}return d.Children.count(c)>1?d.Children.only(null):null});return b.displayName=`${a}.SlotClone`,b}(a),c=d.forwardRef((a,c)=>{let{children:e,...g}=a,h=d.Children.toArray(e),i=h.find(j);if(i){let a=i.props.children,e=h.map(b=>b!==i?b:d.Children.count(a)>1?d.Children.only(null):d.isValidElement(a)?a.props.children:null);return(0,f.jsx)(b,{...g,ref:c,children:d.isValidElement(a)?d.cloneElement(a,void 0,e):null})}return(0,f.jsx)(b,{...g,ref:c,children:e})});return c.displayName=`${a}.Slot`,c}var h=g("Slot"),i=Symbol("radix.slottable");function j(a){return d.isValidElement(a)&&"function"==typeof a.type&&"__radixId"in a.type&&a.type.__radixId===i}},99473:(a,b,c)=>{"use strict";c.d(b,{default:()=>d});let d=(0,c(97954).registerClientReference)(function(){throw Error("Attempted to call the default export of \"/home/brunoadsba/sgn/src/app/normas/[id]/components/BotoesSeguranca.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/home/brunoadsba/sgn/src/app/normas/[id]/components/BotoesSeguranca.tsx","default")}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[5873,1428,9340,3991,2875,6420],()=>b(b.s=2659));module.exports=c})();