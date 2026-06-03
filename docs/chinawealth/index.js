import {s as c1, a as d1, d as K, b as q, c as b, p as J, o as G, r as m1, u as p1, e as f1, w as _1, f as R, g as _, h as v, i as f, j as m, k as p, l as L1, E as C1, m as g1, n as O, q as h, t as s, v as Y, x as P, y as E1, z as g, A as h1, T as N, B as $, C as F1, D as y1, F as A, G as T, H as v1, I as A1, J as M, K as b1, L as D1, M as B1, N as w1, O as S1, P as k1, Q as x1, R as Q, S as w, U as F, V as S, W as T1, X as e1, Y as M1, Z as x, _ as t1, $ as V} from "./vendor-04dc1838.chunk.js";
(function() {
    const t = document.createElement("link").relList;
    if (t && t.supports && t.supports("modulepreload"))
        return;
    for (const u of document.querySelectorAll('link[rel="modulepreload"]'))
        n(u);
    new MutationObserver(u => {
        for (const i of u)
            if (i.type === "childList")
                for (const r of i.addedNodes)
                    r.tagName === "LINK" && r.rel === "modulepreload" && n(r)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function o(u) {
        const i = {};
        return u.integrity && (i.integrity = u.integrity),
        u.referrerPolicy && (i.referrerPolicy = u.referrerPolicy),
        u.crossOrigin === "use-credentials" ? i.credentials = "include" : u.crossOrigin === "anonymous" ? i.credentials = "omit" : i.credentials = "same-origin",
        i
    }
    function n(u) {
        if (u.ep)
            return;
        u.ep = !0;
        const i = o(u);
        fetch(u.href, i)
    }
}
)();
if (typeof window < "u") {
    let e = function() {
        var t = document.body
          , o = document.getElementById("__svg__icons__dom__");
        o || (o = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        o.style.position = "absolute",
        o.style.width = "0",
        o.style.height = "0",
        o.id = "__svg__icons__dom__",
        o.setAttribute("xmlns", "http://www.w3.org/2000/svg"),
        o.setAttribute("xmlns:link", "http://www.w3.org/1999/xlink")),
        o.innerHTML = `<symbol viewBox="0 0 16 17"   id="icon-add">
    <title>icon-新增</title>
    <defs>
        <path d="M16,3 L16,16 L3,16 L3,3 L16,3 Z M10.44444,6 L8.666665,6 L8.666665,8.666666 L6,8.666666 L6,10.444443 L8.666665,10.444443 L8.666665,13.111109 L10.44444,13.111109 L10.44444,10.444443 L13.11111,10.444443 L13.11111,8.666666 L10.44444,8.666666 L10.44444,6 Z M12,0 L12,2.33333 L11,2.33333 L11,1 L1,1 L1,11 L2.333333,11 L2.333333,12 L0,12 L0,0 L12,0 Z" id="icon-add_path-1" />
    </defs>
    <g id="icon-add_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-add_icon-新增" transform="translate(0, 0.5665)">
            <mask id="icon-add_mask-2" fill="white">
                <use xlink:href="#icon-add_path-1" />
            </mask>
            <g id="icon-add_Clip-2"></g>
            <polygon id="icon-add_Fill-1" fill="#FFFFFF" mask="url(#icon-add_mask-2)" points="-1 -1 17 -1 17 17 -1 17" />
        </g>
    </g>
</symbol><symbol viewBox="0 0 16 15"   id="icon-batch">
    <title>icon-批量</title>
    <defs>
        <path d="M13.0692329,3.90788706 L2.52604329,3.90788706 C1.27908612,3.90788706 0.268228047,4.91874824 0.268228047,6.16570259 L0.268228047,12.2134231 C0.268228047,13.4603802 1.27908612,14.4712389 2.52604329,14.4712389 L13.0692329,14.4712389 C14.3161976,14.4712389 15.3270494,13.4603802 15.3270494,12.2134231 L15.3270494,6.16570259 C15.3270494,4.91874824 14.3161976,3.90788706 13.0692329,3.90788706 L13.0692329,3.90788706 Z M10.8114165,9.72377882 L8.33185506,9.72377882 L8.33185506,12.2134231 C8.33185506,12.5112452 8.09042259,12.7526786 7.79260047,12.7526786 C7.49477741,12.7526786 7.25334494,12.5112452 7.25334494,12.2134231 L7.25334494,9.71369882 L4.78385882,9.71369882 C4.48046965,9.71369882 4.23452424,9.46775341 4.23452424,9.16436424 C4.23452424,8.86097506 4.48046965,8.61502965 4.78385882,8.61502965 L7.25334494,8.61502965 L7.25334494,6.14554353 C7.25334494,5.84772141 7.49477741,5.60628706 7.79260047,5.60628706 C8.09042259,5.60628706 8.33185506,5.84772141 8.33185506,6.14554353 L8.33185506,8.61502965 L10.8013365,8.61502965 C11.0708706,8.65196518 11.2717365,8.88223529 11.2717365,9.15428518 C11.2717365,9.42633412 11.0708706,9.65660424 10.8013365,9.69353976 L10.8114165,9.72377882 Z M4.35043953,1.71055059 L11.4061176,1.71055059 C11.6844518,1.71055059 11.9100894,1.48491294 11.9100894,1.20656941 C11.9100894,0.928235294 11.6844518,0.702597647 11.4061176,0.702597647 L4.35043953,0.702597647 C4.07210071,0.702597647 3.84646306,0.928235294 3.84646306,1.20656941 C3.84646306,1.48491294 4.07210071,1.71055059 4.35043953,1.71055059 Z M2.33453271,3.37367529 L13.4220235,3.37367529 C13.7003576,3.37367529 13.9259953,3.14803765 13.9259953,2.86969412 C13.9259953,2.59136 13.7003576,2.36572235 13.4220235,2.36572235 L2.33453271,2.36572235 C2.05619388,2.36572235 1.83055624,2.59136 1.83055624,2.86969412 C1.83055624,3.14803765 2.05619388,3.37367529 2.33453271,3.37367529 Z" id="icon-batch_path-1" />
    </defs>
    <g id="icon-batch_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-batch_icon-批量" transform="translate(0.2739, 0.0077)">
            <mask id="icon-batch_mask-2" fill="white">
                <use xlink:href="#icon-batch_path-1" />
            </mask>
            <g id="icon-batch_Clip-2"></g>
            <polygon id="icon-batch_Fill-1" fill="#FFFFFF" mask="url(#icon-batch_mask-2)" points="-0.672948424 -0.238578824 16.2682259 -0.238578824 16.2682259 15.4124153 -0.672948424 15.4124153" />
        </g>
    </g>
</symbol><symbol viewBox="0 0 17 16"   id="icon-confirm">
    <title>icon-确认/提交</title>
    <g id="icon-confirm_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-confirm_icon-确认/提交" transform="translate(0.106, 0)">
            <g id="icon-confirm_编组" transform="translate(0, 2.137)" fill="#FFFFFF" fill-rule="nonzero">
                <path d="M5.72690763,11.7260152 C5.3556448,11.7260152 4.98259705,11.5850067 4.69879518,11.3012048 L4.64,11.236 L0.425702811,7.02097278 C-0.141900937,6.45336903 -0.141900937,5.53413655 0.425702811,4.9665328 C0.99330656,4.39892905 1.91253905,4.39892905 2.48014279,4.9665328 L5.729,8.215 L13.5198572,0.425702811 C14.087461,-0.141900937 15.0066934,-0.141900937 15.5742972,0.425702811 C16.1419009,0.99330656 16.1419009,1.91253905 15.5742972,2.48014279 L6.80786895,11.2514533 C6.79250564,11.268316 6.77667426,11.2849054 6.76037483,11.3012048 C6.47657296,11.5850067 6.10531013,11.7260152 5.7340473,11.7260152 Z" id="icon-confirm_形状结合" />
            </g>
        </g>
    </g>
</symbol><symbol viewBox="0 0 17 17"   id="icon-customSet">
    <title>icon-自定义设置</title>
    <g id="icon-customSet_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-customSet_icon-自定义设置" transform="translate(0.376, 0.0787)" fill="#FFFFFF">
            <path d="M11.3178033,0.655633219 L11.4138835,0.701223333 L13.6701491,2.00536659 C13.9198298,2.14804695 14.0412501,2.43627767 13.9793199,2.70865835 L13.9473898,2.8097486 L13.5515888,3.78558104 C13.4640386,4.00080158 13.5059887,4.24339219 13.6464391,4.42944265 C13.9601599,4.84531369 14.2228105,5.30130483 14.428921,5.78830605 C14.5070912,5.97122651 14.6562916,6.11260686 14.8431921,6.16993701 L14.9396323,6.19140706 L15.9829549,6.33732742 C16.2718756,6.37672752 16.4943062,6.60227809 16.5332763,6.88367679 L16.5393063,6.97936703 L16.5383463,8.28085228 L11.0746227,8.28168928 C11.0746227,6.93865593 10.02905,5.83936618 8.70766673,5.75356596 L8.54111632,5.74817595 C7.14212282,5.74817595 6.00759998,6.88269579 6.00759998,8.28168928 C6.00759998,9.62472264 7.0531726,10.7240134 8.3745559,10.8098086 L8.53932631,10.8148586 L8.53932631,14.6818683 C8.36296587,14.6820373 8.18827543,14.6739303 8.015735,14.6587982 L7.75862436,14.6309662 C7.55850386,14.6059511 7.35839336,14.6653612 7.214553,14.8000056 L7.14759283,14.8735548 L6.50190122,15.6998183 C6.32518078,15.9268026 6.02451002,16.0067876 5.76259937,15.9077471 L5.66651913,15.8621526 L3.41025349,14.55983 C3.16057286,14.4171546 3.03915256,14.1289209 3.10108272,13.8565392 L3.1330128,13.755455 L3.52881379,12.7796255 C3.616364,12.564396 3.5744139,12.3218064 3.43396355,12.1357599 C3.12024276,11.7198929 2.85759211,11.2638977 2.65148159,10.7768945 C2.5733114,10.5939751 2.42411102,10.4525977 2.23721056,10.3952626 L2.14076032,10.3737945 L1.09744771,10.2278761 C0.810166989,10.186837 0.587896433,9.96111948 0.546316329,9.68103278 L0.539306312,9.58583554 L0.539306312,6.97936703 C0.539306312,6.6871653 0.732846796,6.43632767 1.00558748,6.35584747 L1.09926771,6.33549742 L2.14259032,6.18958705 C2.3742309,6.15857698 2.56210137,6.00171658 2.6533016,5.78648605 C2.85759211,5.29948483 3.12206277,4.84348369 3.43579355,4.42762265 C3.55617385,4.26815225 3.60419397,4.06848175 3.56032386,3.87800128 L3.53063379,3.78375104 L3.1348328,2.8079186 C3.02782253,2.54202794 3.10817273,2.24154718 3.32462328,2.06403674 L3.41208349,2.00354659 L5.66833913,0.701223333 C5.91802976,0.556932973 6.22680053,0.595663069 6.43196104,0.785393544 L6.50372122,0.863563739 L7.14941284,1.6898258 C7.2935132,1.87586627 7.52698378,1.96159648 7.76044436,1.93241641 C8.015805,1.89957633 8.27663566,1.88133628 8.54111632,1.88133628 C8.80558698,1.88133628 9.06641763,1.89957633 9.32177827,1.93241641 C9.52188877,1.95742647 9.72200927,1.89801633 9.86583963,1.76337599 L9.9328098,1.6898258 L10.5785014,0.863563739 C10.7552219,0.636573172 11.0558826,0.556592972 11.3178033,0.655633219 Z" id="icon-customSet_路径" />
            <path d="M15.7424443,14.3558095 C16.1825354,14.3558095 16.5393063,14.7125794 16.5393063,15.1526775 C16.5393063,15.5927746 16.1825354,15.9495448 15.7424443,15.9495448 L15.7424443,15.9495448 L10.9187523,15.9495448 C10.4786512,15.9495448 10.1218803,15.5927746 10.1218803,15.1526775 C10.1218803,14.7125794 10.4786512,14.3558095 10.9187523,14.3558095 L10.9187523,14.3558095 L15.7424443,14.3558095 Z" id="icon-customSet_路径" />
            <path d="M15.7424443,11.9535195 C16.1825354,11.9535195 16.5393063,12.3102894 16.5393063,12.7503865 C16.5393063,13.1904846 16.1825354,13.5472544 15.7424443,13.5472544 L15.7424443,13.5472544 L10.9187523,13.5472544 C10.4786512,13.5472544 10.1218803,13.1904846 10.1218803,12.7503865 C10.1218803,12.3102894 10.4786512,11.9535195 10.9187523,11.9535195 L10.9187523,11.9535195 L15.7424443,11.9535195 Z" id="icon-customSet_路径" />
            <path d="M15.7424443,9.56504149 C16.1825354,9.56504149 16.5393063,9.92181138 16.5393063,10.3619085 C16.5393063,10.8020066 16.1825354,11.1587765 15.7424443,11.1587765 L15.7424443,11.1587765 L10.9187523,11.1587765 C10.4786512,11.1587765 10.1218803,10.8020066 10.1218803,10.3619085 C10.1218803,9.92181138 10.4786512,9.56504149 10.9187523,9.56504149 L10.9187523,9.56504149 L15.7424443,9.56504149 Z" id="icon-customSet_路径" />
        </g>
    </g>
</symbol><symbol viewBox="0 0 16 17"   id="icon-defaultSet">
    <title>icon-默认设置</title>
    <defs>
        <path d="M12.99996,0 C14.65681,0 15.99996,1.34315 15.99996,3 L15.99996,12.99996 C15.99996,14.656814 14.65681,15.99996 12.99996,15.99996 L3,15.99996 C1.343146,15.99996 0,14.656814 0,12.99996 L0,3 C0,1.34315 1.343146,0 3,0 L12.99996,0 Z M12.99996,1 L3,1 C1.945638,1 1.081835,1.81588 1.005486,2.85074 L1,3 L1,12.99996 C1,14.054322 1.815878,14.918125 2.850738,14.994474 L3,14.99996 L12.99996,14.99996 C14.05432,14.99996 14.91813,14.184082 14.99447,13.149222 L14.99996,12.99996 L14.99996,3 C14.99996,1.94564 14.18408,1.08183 13.14922,1.00549 L12.99996,1 Z M9.301245,3.26614 C9.428117,3.10319 9.65509,3.05896 9.83434,3.16255 L9.83434,3.16255 L11.27416,3.99478 C11.45341,4.09721 11.52907,4.3172 11.45108,4.50809 L11.45108,4.50809 L11.1985,5.13081 C11.14263,5.26816 11.16941,5.42297 11.25903,5.54169 C11.45923,5.80707 11.62684,6.098064 11.75837,6.408842 C11.81657,6.545026 11.93646,6.645127 12.08428,6.666078 L12.08428,6.666078 L12.75007,6.759195 C12.95493,6.78713 13.1074,6.961725 13.1051257,7.16891 L13.1051257,7.16891 L13.1051257,8.832214 C13.1051257,9.038235 12.95376,9.21283 12.7489,9.241929 L12.7489,9.241929 L12.08312,9.335046 C11.93529,9.354833 11.81541,9.454934 11.75721,9.592282 C11.62684,9.90306 11.45807,10.194051 11.25787,10.459434 C11.16824,10.578158 11.14147,10.732966 11.19734,10.870313 L11.19734,10.870313 L11.44992,11.493033 C11.52674,11.683923 11.45225,11.902749 11.273,12.006341 L11.273,12.006341 L9.833176,12.837411 C9.653926,12.941004 9.426953,12.896773 9.300081,12.733818 L9.300081,12.733818 L8.888038,12.206543 C8.796085,12.087819 8.647098,12.033112 8.49811,12.051736 C8.335155,12.072687 8.168709,12.084327 7.999934,12.084327 C7.831159,12.084327 7.664713,12.072687 7.501758,12.051736 C7.35277,12.033112 7.203783,12.087819 7.11183,12.206543 L7.11183,12.206543 L6.699787,12.733818 C6.572915,12.896773 6.345942,12.941004 6.166692,12.837411 L6.166692,12.837411 L4.72687,12.006341 C4.547619,11.903912 4.471962,11.683923 4.549947,11.493033 L4.549947,11.493033 L4.802527,10.870313 C4.858397,10.732966 4.831626,10.578158 4.742001,10.459434 C4.541799,10.194051 4.374189,9.90306 4.242661,9.592282 C4.184463,9.456098 4.064575,9.355997 3.916751,9.335046 L3.916751,9.335046 L3.250964,9.241929 C3.047271,9.21283 2.894792,9.038235 2.894792,8.832214 L2.894792,8.832214 L2.894792,7.16891 C2.894792,6.961725 3.047271,6.78713 3.252128,6.758031 L3.252128,6.758031 L3.917915,6.664914 C4.065738,6.645127 4.185627,6.545026 4.243825,6.407678 C4.374189,6.0969 4.542963,5.80591 4.743165,5.54053 C4.83279,5.4218 4.859561,5.26816 4.803691,5.12965 L4.803691,5.12965 L4.551111,4.50693 C4.47429,4.31604 4.548783,4.09721 4.728034,3.99362 L4.728034,3.99362 L6.167856,3.16255 C6.347106,3.05896 6.574079,3.10319 6.700951,3.26614 L6.700951,3.26614 L7.112994,3.79342 C7.204947,3.91214 7.353934,3.96685 7.502922,3.94822 C7.665877,3.92727 7.832323,3.91563 8.001098,3.91563 C8.169873,3.91563 8.336319,3.92727 8.499274,3.94822 C8.648261,3.96685 8.797249,3.91214 8.889202,3.79342 L8.889202,3.79342 L9.301245,3.26614 Z M8.001098,6.383235 C7.108338,6.383235 6.384353,7.10722 6.384353,7.99998 C6.384353,8.89274 7.108338,9.616725 8.001098,9.616725 C8.893858,9.616725 9.617843,8.89274 9.617843,7.99998 C9.617843,7.10722 8.893858,6.383235 8.001098,6.383235 Z" id="icon-defaultSet_path-1" />
    </defs>
    <g id="icon-defaultSet_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-defaultSet_icon-默认设置" transform="translate(-0, 0.0665)">
            <mask id="icon-defaultSet_mask-2" fill="white">
                <use xlink:href="#icon-defaultSet_path-1" />
            </mask>
            <g id="icon-defaultSet_Clip-2"></g>
            <polygon id="icon-defaultSet_Fill-1" fill="#FFFFFF" mask="url(#icon-defaultSet_mask-2)" points="-1 -1 16.99996 -1 16.99996 16.99996 -1 16.99996" />
        </g>
    </g>
</symbol><symbol viewBox="0 0 17 17"   id="icon-delete">
    <title>icon-删除</title>
    <defs>
        <path d="M14.40244,3.30385 L14.40244,14.730116 C14.40244,15.4323188 13.83014,16 13.12222,16 L13.12222,16 L2.880488,16 C2.172572,16 1.600271,15.4323188 1.600271,14.730116 L1.600271,14.730116 L1.600271,3.30385 L14.40244,3.30385 Z M12.09968,6.631915 L10.49941,6.631915 L10.49941,12.981335 L12.09968,12.981335 L12.09968,6.631915 Z M8.801492,6.631915 L7.201221,6.631915 L7.201221,12.981335 L8.801492,12.981335 L8.801492,6.631915 Z M5.500593,6.631915 L3.900322,6.631915 L3.900322,12.981335 L5.500593,12.981335 L5.500593,6.631915 Z M12.82929,0 L12.82929,0.79368 L16,0.79368 L16,2.38103 L0,2.38103 L0,0.79368 L3.227666,0.79368 L3.227666,0 L12.82929,0 Z" id="icon-delete_path-1" />
    </defs>
    <g id="icon-delete_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-delete_icon-删除" transform="translate(0.5479, 0.5665)">
            <mask id="icon-delete_mask-2" fill="white">
                <use xlink:href="#icon-delete_path-1" />
            </mask>
            <g id="icon-delete_Clip-2"></g>
            <polygon id="icon-delete_Fill-1" fill="#FFFFFF" mask="url(#icon-delete_mask-2)" points="-1 -1 17 -1 17 17 -1 17" />
        </g>
    </g>
</symbol><symbol   viewBox="0 0 13 16" id="icon-download">
  <g transform="matrix(1 0 0 1 -368 -217 )">
    <path d="M 6.5 13.3333333333333  L 0 6.66666666666667  L 3.9 6.66666666666667  L 3.9 0  L 9.1 0  L 9.1 6.66666666666667  L 13 6.66666666666667  L 6.5 13.3333333333333  Z M 13 16  L 0 16  L 0 14.6666666666667  L 13 14.6666666666667  L 13 16  Z " fill-rule="nonzero" fill="#ffffff" stroke="currentColor" transform="matrix(1 0 0 1 368 217 )" />
  </g>
</symbol><symbol viewBox="0 0 16 17"   id="icon-edit">
    <title>icon-修改</title>
    <defs>
        <path d="M4.53422,10.745859 L5.90515,12.089092 L4.32205,13.640205 L3.73451,14.215876 L3.19593,14.743576 C3.0436,14.892824 2.91576,15.0207506 2.81239,15.1273558 C2.70903,15.2339615 2.65191,15.2925945 2.64103,15.303255 C2.58662,15.3458974 2.52678,15.3912048 2.4615,15.4391775 C2.39622,15.4871501 2.33093,15.5271273 2.26565,15.559109 C2.20037,15.5910907 2.09973,15.6310678 1.96372,15.6790405 C1.82771,15.7270131 1.68899,15.7723205 1.54754,15.8149629 C1.4061,15.8576053 1.27009,15.8949172 1.13953,15.9268989 C1.00896,15.9588806 0.911039,15.9802018 0.845757,15.9908623 C0.715192,16.0121835 0.628149,15.9961926 0.584627,15.9428897 C0.541105593,15.8895868 0.530225,15.798972 0.551986,15.6710442 C0.562866,15.6070808 0.584627,15.5111349 0.617268,15.3832087 C0.64991,15.2552818 0.687991,15.1246901 0.731513,14.991433 C0.775034,14.858176 0.815836,14.732914 0.853917,14.615647 C0.891999,14.498381 0.92192,14.418427 0.943681,14.375785 C1.00896,14.237197 1.09601,14.114601 1.20481,14.007994 L1.41698,13.800115 L1.825,13.400343 C1.9882,13.240434 2.16773,13.06187 2.36358,12.864649 C2.55942,12.667429 2.75527,12.472873 2.95112,12.280983 C3.41898,11.822577 3.94668,11.310869 4.53422,10.745859 Z M5.92148,9.698464 C6.0738,9.714455 6.19893,9.749102 6.29685,9.802404 C6.40566,9.855707 6.52262,9.948987 6.64775,10.082244 C6.77287,10.215501 6.86808,10.356754 6.93336,10.506002 C6.966,10.591287 6.98776,10.697894 6.99864,10.82582 C7.00952,10.953747 6.95512,11.076343 6.83543,11.19361 C6.78103,11.246913 6.73207,11.297551 6.68855,11.345523 C6.64503,11.393496 6.60694,11.433473 6.5743,11.465455 C6.53078,11.508097 6.4927,11.540079 6.46006,11.5614 L5.07281,10.218167 C5.13809,10.164864 5.21153,10.100901 5.29313,10.026276 C5.37474,9.951652 5.44274,9.893019 5.49714,9.850377 C5.62771,9.733111 5.76915,9.682474 5.92148,9.698464 Z M1.22114,0 C1.31907,0 1.41155,0.01066 1.4986,0.03198 C1.58564,0.0533 1.69172,0.10394 1.81685,0.1839 C1.94197,0.26385 2.0943,0.37579 2.27382,0.51971 C2.45335,0.66362 2.67912,0.85285 2.95113,1.08738 C3.2449,1.34323 3.47883,1.55911 3.65292,1.73501 C3.827,1.91091 3.96029,2.06016 4.05277,2.18276 C4.14526,2.30535 4.20238,2.40929 4.22414,2.49458 C4.2459,2.57986 4.25678,2.65449 4.25678,2.71845 L4.25678,2.97431 L1.85764,2.97431 C1.73796,2.97431 1.63732,2.93433 1.55572,2.85438 C1.47411,2.77442 1.40611,2.68114 1.35171,2.57454 C1.29731,2.46793 1.25651,2.35866 1.2293,2.24672 C1.2021,2.13479 1.1885,2.04151 1.1885,1.96689 L1.1885,0 L1.22114,0 Z" id="icon-edit_path-1" />
        <path d="M8.160311,0 L8.160311,1.99887 C8.160311,2.20142 8.192952,2.41996 8.258235,2.65449 C8.323517,2.88902 8.424161,3.1049 8.560166,3.30212 C8.696172,3.49934 8.872978,3.66458 9.09059,3.79784 C9.3082,3.9311 9.56933,3.99772 9.87398,3.99772 L12.25679,3.99772 L12.25679,9.290695 L11.8805,9.666404 C11.7602,9.78658 11.64504,9.901697 11.53501,10.011754 L11.07454,10.472857 C10.12828,11.421635 9.69545,11.864436 9.77605,11.801262 L6.609856,15.0314158 L0,15.0314158 L0,0 L8.160311,0 Z M9,9 L2,9 L2,10.5 L9,10.5 L9,9 Z M9,5 L2,5 L2,6.5 L9,6.5 L9,5 Z" id="icon-edit_path-3" />
    </defs>
    <g id="icon-edit_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-edit_icon-修改" transform="translate(0.2739, 0.5665)">
            <g id="icon-edit_编组" transform="translate(8, 0)">
                <mask id="icon-edit_mask-2" fill="white">
                    <use xlink:href="#icon-edit_path-1" />
                </mask>
                <g id="icon-edit_Clip-2"></g>
                <polygon id="icon-edit_Fill-1" fill="#FFFFFF" mask="url(#icon-edit_mask-2)" points="-0.469775 -1 8 -1 8 17 -0.469775 17" />
            </g>
            <g id="icon-edit_编组">
                <mask id="icon-edit_mask-4" fill="white">
                    <use xlink:href="#icon-edit_path-3" />
                </mask>
                <g id="icon-edit_Clip-4"></g>
                <polygon id="icon-edit_Fill-3" fill="#FFFFFF" mask="url(#icon-edit_mask-4)" points="-1 -1 13.25679 -1 13.25679 16.0314158 -1 16.0314158" />
            </g>
        </g>
    </g>
</symbol><symbol  viewBox="0 0 128 128" id="icon-exit-fullscreen"><path d="M49.217 41.329l-.136-35.24c-.06-2.715-2.302-4.345-5.022-4.405h-3.65c-2.712-.06-4.866 2.303-4.806 5.016l.152 19.164-24.151-23.79a6.698 6.698 0 0 0-9.499 0 6.76 6.76 0 0 0 0 9.526l23.93 23.713-18.345.074c-2.712-.069-5.228 1.813-5.64 5.02v3.462c.069 2.721 2.31 4.97 5.022 5.03l35.028-.207c.052.005.087.025.133.025l2.457.054a4.626 4.626 0 0 0 3.436-1.38c.88-.874 1.205-2.096 1.169-3.462l-.262-2.465c0-.048.182-.081.182-.136h.002zm52.523 51.212l18.32-.073c2.713.06 5.224-1.609 5.64-4.815v-3.462c-.068-2.722-2.317-4.97-5.021-5.04l-34.58.21c-.053 0-.086-.021-.138-.021l-2.451-.06a4.64 4.64 0 0 0-3.445 1.381c-.885.868-1.201 2.094-1.174 3.46l.27 2.46c.005.06-.177.095-.177.141l.141 34.697c.069 2.713 2.31 4.338 5.022 4.397l3.45.006c2.705.062 4.867-2.31 4.8-5.026l-.153-18.752 24.151 23.946a6.69 6.69 0 0 0 9.494 0 6.747 6.747 0 0 0 0-9.523L101.74 92.54v.001zM48.125 80.662a4.636 4.636 0 0 0-3.437-1.382l-2.457.06c-.05 0-.082.022-.137.022l-35.025-.21c-2.712.07-4.957 2.318-5.022 5.04v3.462c.409 3.206 2.925 4.874 5.633 4.814l18.554.06-24.132 23.928c-2.62 2.626-2.62 6.89 0 9.524a6.694 6.694 0 0 0 9.496 0l24.155-23.79-.155 18.866c-.06 2.722 2.094 5.093 4.801 5.025h3.65c2.72-.069 4.962-1.685 5.022-4.406l.141-34.956c0-.05-.182-.082-.182-.136l.262-2.46c.03-1.366-.286-2.592-1.166-3.46h-.001zM80.08 47.397a4.62 4.62 0 0 0 3.443 1.374l2.45-.054c.055 0 .088-.02.143-.028l35.08.21c2.712-.062 4.953-2.312 5.021-5.033l.009-3.463c-.417-3.211-2.937-5.084-5.64-5.025l-18.615-.073 23.917-23.715c2.63-2.623 2.63-6.879.008-9.513a6.691 6.691 0 0 0-9.494 0L92.251 26.016l.155-19.312c.065-2.713-2.097-5.085-4.802-5.025h-3.45c-2.713.069-4.954 1.693-5.022 4.406l-.139 35.247c0 .054.18.088.18.136l-.267 2.465c-.028 1.366.288 2.588 1.174 3.463v.001z" /></symbol><symbol class="icon" viewBox="0 0 1024 1024"   id="icon-password"><defs><style type="text/css"></style></defs><path d="M868.593046 403.832442c-30.081109-28.844955-70.037123-44.753273-112.624057-44.753273L265.949606 359.079168c-42.554188 0-82.510202 15.908318-112.469538 44.690852-30.236652 28.782533-46.857191 67.222007-46.857191 108.198258l0 294.079782c0 40.977273 16.619516 79.414701 46.702672 108.136859 29.959336 28.844955 70.069869 44.814672 112.624057 44.814672l490.019383 0c42.585911 0 82.696444-15.969717 112.624057-44.814672 30.082132-28.844955 46.579875-67.222007 46.579875-108.136859L915.172921 511.968278C915.171897 471.053426 898.675178 432.677397 868.593046 403.832442zM841.821309 806.049083c0 22.098297-8.882298 42.772152-25.099654 58.306964-16.154935 15.661701-37.81935 24.203238-60.752666 24.203238L265.949606 888.559285c-22.934339 0-44.567032-8.54256-60.877509-24.264637-16.186657-15.474436-25.067932-36.148291-25.067932-58.246589L180.004165 511.968278c0-22.035876 8.881274-42.772152 25.192775-58.307987 16.186657-15.536858 37.81935-24.139793 60.753689-24.139793l490.019383 0c22.933315 0 44.597731 8.602935 60.752666 24.139793 16.21838 15.535835 25.099654 36.272112 25.099654 58.307987L841.822332 806.049083zM510.974136 135.440715c114.914216 0 208.318536 89.75214 208.318536 200.055338l73.350588 0c0-149.113109-126.366036-270.496667-281.669124-270.496667-155.333788 0-281.699824 121.383558-281.699824 270.496667l73.350588 0C302.623877 225.193879 396.059919 135.440715 510.974136 135.440715zM474.299865 747.244792l73.350588 0L547.650453 629.576859l-73.350588 0L474.299865 747.244792z" p-id="2751" /></symbol><symbol viewBox="0 0 17 17"   id="icon-reRelease">
    <title>icon-重新发布</title>
    <g id="icon-reRelease_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-reRelease_icon-重新发布" transform="translate(0.2954, 0.4238)" fill="#FFFFFF" fill-rule="nonzero">
            <path d="M13.9354448,12.9032051 L7.22584854,10.8386688 L13.9354826,3.09677602 L5.16131227,10.8386688 L2.62707855e-16,8.77417037 L16.5161199,5.2541571e-16 L13.9354448,12.9032051 L13.9354448,12.9032051 Z M7.22584854,16 L7.22584854,12.3870852 L9.29029021,13.4193439 L7.22584854,16 L7.22584854,16 Z" id="icon-reRelease_形状" />
        </g>
    </g>
</symbol><symbol viewBox="0 0 15 17"   id="icon-releaseEdit">
    <title>icon-发布后修改</title>
    <defs>
        <path d="M14.098131,15.8623587 L1.1626083,15.8623587 C0.79337718,15.8623587 0.47030031,16.1854362 0.47030031,16.5546666 C0.47030031,16.9238979 0.79337718,17.2469744 1.1626083,17.2469744 L14.144283,17.2469744 C14.513517,17.2469744 14.83659,16.9238979 14.83659,16.5546666 C14.83659,16.1854362 14.513517,15.8623587 14.098131,15.8623587 Z M2.2241466,14.7546666 L5.1318387,14.6162052 C5.6856852,14.662359 6.193377,14.43159 6.5626083,14.0623587 L12.101067,8.5239 L6.7472235,3.170052 L1.2087621,8.708517 C0.83953107,9.0777438 0.65491569,9.5854356 0.65491569,10.0931283 L0.42414642,12.8162052 L0.42414642,12.9085128 C0.42414642,13.4162055 0.65491569,13.8777435 0.9779922,14.200821 C1.3010697,14.5238976 1.7164539,14.7085128 2.2241466,14.7546666 Z M14.270301,3.63159 L11.639529,1.000818 C10.90107,0.262359 9.654912,0.262359 8.9164539,1.000818 L7.7164542,2.200824 L13.070304,7.554663 L14.270301,6.354666 C15.00876,5.570055 15.00876,4.370049 14.270301,3.63159 Z" id="icon-releaseEdit_path-1" />
    </defs>
    <g id="icon-releaseEdit_页面-1" stroke="currentColor" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon-releaseEdit_icon-发布后修改" transform="translate(-0.1782, -0.3512)">
            <mask id="icon-releaseEdit_mask-2" fill="white">
                <use xlink:href="#icon-releaseEdit_path-1" />
            </mask>
            <g id="icon-releaseEdit_Clip-2"></g>
            <polygon id="icon-releaseEdit_Fill-1" fill="#FFFFFF" mask="url(#icon-releaseEdit_mask-2)" points="-0.47585358 -0.637641 15.90876 -0.637641 15.90876 18.1469744 -0.47585358 18.1469744" />
        </g>
    </g>
</symbol>`,
        t.insertBefore(o, t.lastChild)
    };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", e) : e()
}
let I1 = [c1, d1];
const R1 = {
    install: e => {
        I1.forEach(t => e.component(t.name, t))
    }
}
  , I = {
    title: "中国理财网信息披露平台",
    dynamicTitle: !0
};
function O1() {
    let e = z()
      , {dynamicTitle: t, title: o} = e;
    t ? document.title = o + " - " + I.title : document.title = I.title
}
const z = K("settings", {
    state: () => ({
        title: "",
        theme: "#c9a063",
        dynamicTitle: I.dynamicTitle
    }),
    actions: {
        setTitle(e) {
            this.title = e,
            O1()
        }
    }
})
  , E = K("app", {
    state: () => ({
        device: "desktop",
        size: q.get("size") || "default",
        licenseStr: ""
    }),
    actions: {
        toggleDevice(e) {
            this.device = e
        },
        setSize(e) {
            this.size = e,
            q.set("size", e)
        },
        setLicenseStr(e) {
            this.licenseStr = e
        }
    }
});
function P1(e) {
    document.documentElement.style.setProperty("--el-color-primary", e);
    for (let t = 1; t <= 9; t++)
        document.documentElement.style.setProperty(`--el-color-primary-light-${t}`, `${N1(e, t / 10)}`);
    for (let t = 1; t <= 9; t++)
        document.documentElement.style.setProperty(`--el-color-primary-dark-${t}`, `${V1(e, t / 10)}`)
}
function n1(e) {
    e = e.replace("#", "");
    let t = e.match(/../g);
    for (let o = 0; o < 3; o++)
        t[o] = parseInt(t[o], 16);
    return t
}
function o1(e, t, o) {
    let n = [e.toString(16), t.toString(16), o.toString(16)];
    for (let u = 0; u < 3; u++)
        n[u].length == 1 && (n[u] = `0${n[u]}`);
    return `#${n.join("")}`
}
function N1(e, t) {
    let o = n1(e);
    for (let n = 0; n < 3; n++)
        o[n] = Math.floor((255 - o[n]) * t + o[n]);
    return o1(o[0], o[1], o[2])
}
function V1(e, t) {
    let o = n1(e);
    for (let n = 0; n < 3; n++)
        o[n] = Math.floor(o[n] * (1 - t));
    return o1(o[0], o[1], o[2])
}
const z1 = 992
  , Z1 = {
    __name: "App",
    setup(e) {
        const t = b( () => E().size || "default")
          , o = b( () => E().device)
          , n = b( () => E().device == "mobile");
        J("device", o),
        J("isMobile", n),
        G( () => {
            P1(z().theme)
        }
        );
        const u = m1({
            autoInsertSpace: !1
        })
          , {width: i} = p1()
          , r = f1(i, 500);
        return _1(r, l => {
            l < z1 ? (E().toggleDevice("mobile"),
            E().setSize("small"),
            document.documentElement.style.fontSize = "13px") : (E().toggleDevice("desktop"),
            E().setSize("default"),
            document.documentElement.style.fontSize = "16px")
        }
        , {
            immediate: !0
        }),
        (l, a) => {
            const c = R("router-view")
              , L = C1;
            return _(),
            v(L, {
                locale: p(L1),
                size: p(t),
                button: p(u)
            }, {
                default: f( () => [m(c)]),
                _: 1
            }, 8, ["locale", "size", "button"])
        }
    }
};
let j1 = g1();
const U1 = "modulepreload"
  , H1 = function(e) {
    return "/" + e
}
  , W = {}
  , d = function(t, o, n) {
    if (!o || o.length === 0)
        return t();
    const u = document.getElementsByTagName("link");
    return Promise.all(o.map(i => {
        if (i = H1(i),
        i in W)
            return;
        W[i] = !0;
        const r = i.endsWith(".css")
          , l = r ? '[rel="stylesheet"]' : "";
        if (!!n)
            for (let L = u.length - 1; L >= 0; L--) {
                const C = u[L];
                if (C.href === i && (!r || C.rel === "stylesheet"))
                    return
            }
        else if (document.querySelector(`link[href="${i}"]${l}`))
            return;
        const c = document.createElement("link");
        if (c.rel = r ? "stylesheet" : U1,
        r || (c.as = "script",
        c.crossOrigin = ""),
        c.href = i,
        document.head.appendChild(c),
        r)
            return new Promise( (L, C) => {
                c.addEventListener("load", L),
                c.addEventListener("error", () => C(new Error(`Unable to preload CSS for ${i}`)))
            }
            )
    }
    )).then( () => t()).catch(i => {
        const r = new Event("vite:preloadError",{
            cancelable: !0
        });
        if (r.payload = i,
        window.dispatchEvent(r),
        !r.defaultPrevented)
            throw i
    }
    )
}
  , q1 = "/static/png/logo-695b3f86.png";
const B = (e, t) => {
    const o = e.__vccOpts || e;
    for (const [n,u] of t)
        o[n] = u;
    return o
}
  , J1 = {
    class: "header-top"
}
  , W1 = {
    class: "header-logo"
}
  , X1 = P({
    name: "Header"
})
  , K1 = Object.assign(X1, {
    setup(e) {
        const t = O("isMobile");
        return (o, n) => {
            const u = E1;
            return _(),
            h("div", {
                class: Y([{
                    "is-mobile": p(t)
                }, "header"])
            }, [s("div", J1, [s("div", W1, [n[0] || (n[0] = s("a", {
                href: "https://www.chinawealth.com.cn/"
            }, [s("img", {
                src: q1
            })], -1)), m(u, {
                direction: "vertical"
            }), n[1] || (n[1] = s("a", {
                href: "/"
            }, "理财信息披露平台 ", -1))]), n[2] || (n[2] = s("div", null, [s("span", {
                class: "header-logo-text"
            }, "国家金融监督管理总局指定-全国银行业理财产品信息查询网站")], -1))])], 2)
        }
    }
})
  , G1 = B(K1, [["__scopeId", "data-v-df77f6be"]])
  , Y1 = "/static/png/beian-a20583c8.png"
  , $1 = "data:image/png;base64,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"
  , Q1 = "/static/png/weixinok-9b0ce5e8.png";
const ee = {}
  , te = {
    class: "footer"
}
  , ne = {
    class: "footer_box"
}
  , oe = {
    class: "footer_cwrite"
}
  , ue = {
    class: "footer_content"
};
function ie(e, t) {
    const o = h1;
    return _(),
    h("div", te, [s("div", ne, [s("div", oe, [s("div", ue, [t[2] || (t[2] = g(" ©版权所有：中央国债登记结算有限责任公司   ")), t[3] || (t[3] = s("br", null, null, -1)), m(o, {
        underline: !1,
        target: "_blank",
        href: "https://beian.miit.gov.cn"
    }, {
        default: f( () => t[0] || (t[0] = [g("京ICP备17016011号-6 ")])),
        _: 1
    }), t[4] || (t[4] = s("br", null, null, -1)), m(o, {
        underline: !1,
        target: "_blank",
        href: "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010202008656"
    }, {
        default: f( () => t[1] || (t[1] = [s("img", {
            src: Y1
        }, null, -1), s("span", null, "京公网安备 11010202008656号", -1)])),
        _: 1
    }), t[5] || (t[5] = g("  ")), t[6] || (t[6] = s("img", {
        src: $1,
        width: "30",
        height: "15",
        style: {
            "vertical-align": "middle"
        }
    }, null, -1)), t[7] || (t[7] = g("本网站支持IPV6访问 ")), t[8] || (t[8] = s("br", null, null, -1)), t[9] || (t[9] = s("div", null, [g(" 本网站展示的内容仅可用于个人或机构自身基于非商业目的使用， "), s("br"), g("未经我方许可，任何人不得以商业目的使用本网站的任何内容，具体请见网站声明页面。 "), s("br"), g("信息披露平台披露的所有信息均由披露义务人负责。银行业理财登记托管中心不对信息披露内容的真实性、准确性、完整性、及时性以及合法合规性进行任何形式的审核或核验。 "), s("br"), g("因信息披露内容造成损失的，银行业理财登记托管中心不承担任何责任。 ")], -1)), t[10] || (t[10] = s("br", null, null, -1))]), t[11] || (t[11] = s("div", {
        style: {
            display: "inline-block",
            width: "100px",
            height: "110px"
        }
    }, [s("img", {
        src: Q1,
        width: "105",
        height: "109"
    })], -1))])])])
}
const re = B(ee, [["render", ie], ["__scopeId", "data-v-953cb23a"]])
  , se = {
    class: "layout"
}
  , le = P({
    name: "Layout"
})
  , ae = Object.assign(le, {
    setup(e) {
        return (t, o) => {
            const n = R("router-view")
              , u = F1;
            return _(),
            h("div", se, [m(G1), m(n, null, {
                default: f( ({Component: i}) => [m(N, {
                    name: "fade-transform",
                    mode: "out-in"
                }, {
                    default: f( () => [(_(),
                    v($(i)))]),
                    _: 2
                }, 1024)]),
                _: 1
            }), m(re), m(u)])
        }
    }
});
const ce = {
    key: 0,
    class: "sidebar-title"
}
  , de = {
    __name: "sidebar",
    setup(e) {
        const t = O("isMobile")
          , o = y1()
          , n = b( () => {
            const {meta: r, path: l} = o;
            return r.activeMenu ? r.activeMenu : l
        }
        )
          , u = b( () => t.value ? "horizontal" : "vertical")
          , i = A(!0);
        return G( () => {
            o.query.orgName && (i.value = !1)
        }
        ),
        (r, l) => {
            const a = b1
              , c = D1
              , L = B1;
            return _(),
            h("div", null, [p(t) ? T("", !0) : (_(),
            h("h2", ce, l[0] || (l[0] = [s("i", null, null, -1), g("信息披露")]))), m(L, {
                router: "",
                "default-active": p(n),
                mode: p(u)
            }, {
                default: f( () => [m(a, {
                    index: "/queryMenu/prodType",
                    route: {
                        path: "/queryMenu/prodType",
                        query: p(o).query
                    }
                }, {
                    default: f( () => l[1] || (l[1] = [s("span", null, "产品类型", -1)])),
                    _: 1
                }, 8, ["route"]), p(i) ? (_(),
                v(a, {
                    key: 0,
                    index: "/queryMenu/disclosureSubject"
                }, {
                    default: f( () => l[2] || (l[2] = [s("span", null, "信息披露主体", -1)])),
                    _: 1
                })) : T("", !0), m(c, {
                    index: "2"
                }, {
                    title: f( () => l[3] || (l[3] = [s("span", null, "报告类型", -1)])),
                    default: f( () => [(_(!0),
                    h(v1, null, A1(p(u1), C => (_(),
                    v(a, {
                        key: C.name,
                        index: `/queryMenu/${C.path}`,
                        route: {
                            path: `/queryMenu/${C.path}`,
                            query: p(o).query
                        }
                    }, {
                        default: f( () => [g(M(C.meta.title), 1)]),
                        _: 2
                    }, 1032, ["index", "route"]))), 128))]),
                    _: 1
                })]),
                _: 1
            }, 8, ["default-active", "mode"])])
        }
    }
}
  , me = B(de, [["__scopeId", "data-v-d9aa019a"]]);
const pe = {
    class: "content"
}
  , fe = P({
    name: "QueryMenu"
})
  , _e = Object.assign(fe, {
    setup(e) {
        const t = O("isMobile");
        return (o, n) => {
            const u = R("router-view");
            return _(),
            h("div", {
                class: Y([{
                    "is-mobile": p(t)
                }, "queryMenu"])
            }, [m(me, {
                class: "sidebar"
            }), s("div", pe, [m(u, null, {
                default: f( ({Component: i, route: r}) => [m(N, {
                    name: "fade-transform",
                    mode: "out-in"
                }, {
                    default: f( () => [(_(),
                    v($(i), {
                        key: r.path
                    }))]),
                    _: 2
                }, 1024)]),
                _: 1
            })])], 2)
        }
    }
})
  , Le = B(_e, [["__scopeId", "data-v-f1aaea50"]]);
let u1 = [{
    path: "reportType/salesDocuments",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "SalesDocuments",
    meta: {
        title: "销售文件"
    }
}, {
    path: "reportType/releaseNote",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "ReleaseNote",
    meta: {
        title: "发行公告"
    }
}, {
    path: "reportType/netWorthReport",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "NetWorthReport",
    meta: {
        title: "净值报告"
    }
}, {
    path: "reportType/majorEventNotice",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "MajorEventNotice",
    meta: {
        title: "重大事项公告"
    }
}, {
    path: "reportType/periodicReport",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "PeriodicReport",
    meta: {
        title: "定期报告"
    }
}, {
    path: "reportType/dueNotice",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "DueNotice",
    meta: {
        title: "到期公告"
    }
}, {
    path: "reportType/shortTimeNotice",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "ShortTimeNotice",
    meta: {
        title: "临时公告"
    }
}, {
    path: "reportType/escrowAgreement",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "EscrowAgreement",
    meta: {
        title: "托管协议"
    }
}, {
    path: "reportType/otherInformation",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "OtherInformation",
    meta: {
        title: "其他信息"
    }
}, {
    path: "reportType/financialServicesReport",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "FinancialServicesReport",
    meta: {
        title: "理财业务报告"
    }
}, {
    path: "reportType/companyNotice",
    component: () => d( () => import("./reportTypeDocuments-89ce07c6.chunk.js"), ["static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css"]),
    name: "CompanyNotice",
    meta: {
        title: "公司公告"
    }
}]
  , Z = w1({
    history: S1(),
    routes: [{
        path: "",
        component: ae,
        redirect: "/queryMenu/prodType",
        children: [{
            path: "/queryMenu",
            component: Le,
            name: "QueryMenu",
            meta: {
                title: "产品类型"
            },
            children: [{
                path: "prodType",
                component: () => d( () => import("./index-1af3ed78.chunk.js"), ["static/js/index-1af3ed78.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/prodType-93690200.chunk.js", "static/js/index-bbfac9ad.chunk.js", "static/css/index-70dd00cf.css"]),
                name: "ProdType",
                meta: {
                    title: "产品类型"
                }
            }, {
                path: "disclosureSubject",
                component: () => d( () => import("./index-21d3f197.chunk.js"), ["static/js/index-21d3f197.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/index-bbfac9ad.chunk.js", "static/css/index-209b751b.css"]),
                name: "DisclosureSubject",
                meta: {
                    title: "信息披露主体"
                }
            }, ...u1]
        }, {
            path: "/queryMenu/prodType/prodTypeDetail",
            component: () => d( () => import("./prodTypeDetail-267fd7fb.chunk.js"), ["static/js/prodTypeDetail-267fd7fb.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/prodType-93690200.chunk.js", "static/js/index-bbfac9ad.chunk.js", "static/css/prodTypeDetail-50148c49.css"]),
            name: "ProdTypeDetail",
            meta: {
                title: "产品详情"
            }
        }, {
            path: "/queryMenu/reportType/reportTypeDetail",
            component: () => d( () => import("./reportTypeDetail-1a19b05e.chunk.js"), ["static/js/reportTypeDetail-1a19b05e.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDetail-00cf94d1.css"]),
            name: "reportTypeDetail",
            meta: {
                title: ""
            }
        }]
    }, {
        path: "/prodTypeAuto",
        component: () => d( () => import("./prodTypeAuto-0fe679cc.chunk.js"), ["static/js/prodTypeAuto-0fe679cc.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-1af3ed78.chunk.js", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/prodType-93690200.chunk.js", "static/js/index-bbfac9ad.chunk.js", "static/css/index-70dd00cf.css", "static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css", "static/js/institution-91cea554.chunk.js", "static/css/prodTypeAuto-62b3ab1a.css"]),
        hidden: !0
    }, {
        path: "/prodType",
        component: () => d( () => import("./prodType-96f00891.chunk.js"), ["static/js/prodType-96f00891.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/js/index-1af3ed78.chunk.js", "static/js/index-f13a54e9.chunk.js", "static/css/index-647eb5f2.css", "static/js/prodType-93690200.chunk.js", "static/js/index-bbfac9ad.chunk.js", "static/css/index-70dd00cf.css", "static/js/reportTypeDocuments-89ce07c6.chunk.js", "static/js/index-40cb651b.chunk.js", "static/css/reportTypeDocuments-846624d2.css", "static/js/institution-91cea554.chunk.js", "static/css/prodType-98e6477d.css"]),
        hidden: !0
    }, {
        path: "/401",
        component: () => d( () => import("./401-c45e7445.chunk.js"), ["static/js/401-c45e7445.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/css/401-1a1d8019.css"])
    }, {
        path: "/:pathMatch(.*)*",
        component: () => d( () => import("./404-c0c6ef8c.chunk.js"), ["static/js/404-c0c6ef8c.chunk.js", "static/js/vendor-04dc1838.chunk.js", "static/css/vendor-96cc4a20.css", "static/css/404-dfaad8db.css"])
    }]
});
const Ce = {
    key: 0,
    class: "modal-mask"
}
  , ge = {
    class: "modal-wrapper"
}
  , Ee = {
    class: "modal-container"
}
  , he = {
    class: "modal-body"
}
  , Fe = {
    class: "modal-text"
}
  , ye = {
    __name: "index",
    setup(e, {expose: t}) {
        const o = A(!1)
          , n = A("")
          , u = A(0)
          , i = A(null);
        function r(a="数据处理中...") {
            n.value = a,
            i.value || (u.value = 10,
            o.value = !0,
            i.value = setInterval( () => {
                u.value <= 90 && (u.value = u.value + Math.round(Math.random() * 4 + 5))
            }
            , 500))
        }
        function l() {
            i.value && clearInterval(i.value),
            i.value = null,
            k1( () => {
                o.value = !1,
                u.value = 0
            }
            )
        }
        return t({
            showProgress: r,
            closeProgress: l
        }),
        (a, c) => {
            const L = x1;
            return _(),
            v(N, {
                name: "modal"
            }, {
                default: f( () => [p(o) ? (_(),
                h("div", Ce, [s("div", ge, [s("div", Ee, [c[0] || (c[0] = s("div", {
                    class: "modal-header"
                }, "请稍等", -1)), s("div", he, [s("div", Fe, M(p(n)), 1), m(L, {
                    percentage: p(u),
                    color: "#67C23A",
                    striped: "",
                    "striped-flow": "",
                    "stroke-width": 17,
                    duration: 10
                }, {
                    default: f( ({percentage: C}) => [s("span", null, M(C) + " %", 1)]),
                    _: 1
                }, 8, ["percentage"])])])])])) : T("", !0)]),
                _: 1
            })
        }
    }
}
  , ve = B(ye, [["__scopeId", "data-v-cff60627"]]);
let Ae = Q(ve)
  , i1 = document.createElement("div");
document.body.appendChild(i1);
let r1 = Ae.mount(i1), X;
function be(e) {
    return e ? e.length > 50 ? "输入内容长度在50个字符之内" : !0 : "请输入原因"
}
const D = {
    msg(e) {
        w.info(e)
    },
    msgError(e="流程提交失败！") {
        w.error(e)
    },
    msgSuccess(e="流程提交成功！") {
        w.success(e)
    },
    msgWarning(e) {
        w.warning(e)
    },
    alert(e) {
        F.alert(e, "系统提示")
    },
    alertError(e) {
        F.alert(e, "系统提示", {
            type: "error"
        })
    },
    alertSuccess(e) {
        F.alert(e, "系统提示", {
            type: "success"
        })
    },
    alertWarning(e) {
        F.alert(e, "系统提示", {
            type: "warning"
        })
    },
    notify(e) {
        S.info(e)
    },
    notifyError(e) {
        S.error(e)
    },
    notifySuccess(e) {
        S.success(e)
    },
    notifyWarning(e) {
        S.warning(e)
    },
    confirm(e="是否提交本次操作？") {
        return F.confirm(e, "系统提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
    },
    prompt(e) {
        return F.prompt(e, "系统提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        })
    },
    validPrompt(e) {
        return F.prompt(e, "系统提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            inputValidator: be
        })
    },
    loading(e) {
        X = T1.service({
            lock: !0,
            text: e
        })
    },
    closeLoading() {
        X.close()
    }
};
function De(e, t) {
    if (arguments.length === 0 || !e)
        return null;
    let o = t || "{y}-{m}-{d} {h}:{i}:{s}", n;
    typeof e == "object" ? n = e : (typeof e == "string" && /^[0-9]+$/.test(e) ? e = parseInt(e) : typeof e == "string" && (e = e.replace(new RegExp(/-/gm), "/").replace("T", " ").replace(new RegExp(/\.[\d]{3}/gm), "")),
    typeof e == "number" && e.toString().length === 10 && (e = e * 1e3),
    n = new Date(e));
    let u = {
        y: n.getFullYear(),
        m: n.getMonth() + 1,
        d: n.getDate(),
        h: n.getHours(),
        i: n.getMinutes(),
        s: n.getSeconds(),
        a: n.getDay()
    };
    return o.replace(/{(y|m|d|h|i|s|a)+}/g, (r, l) => {
        let a = u[l];
        return l === "a" ? ["日", "一", "二", "三", "四", "五", "六"][a] : (r.length > 0 && a < 10 && (a = "0" + a),
        a || 0)
    }
    )
}
function Be(e, t) {
    return t = t || typeof t > "u" ? 1 : -1,
    (o, n) => {
        let u = o[e]
          , i = n[e];
        return u < i ? t * -1 : u > i ? t * 1 : 0
    }
}
function we(e, t=15) {
    if (e)
        return e.length > t ? e.substring(0, t) + "..." : e
}
e1.extend(M1);
function Se(e) {
    e.config.globalProperties.$progress = r1,
    e.config.globalProperties.$modal = D,
    e.config.globalProperties.parseTime = De,
    e.config.globalProperties.compareByKey = Be,
    e.config.globalProperties.formatLongStr = we,
    e.config.globalProperties.dayjs = e1
}
const ke = {
    mounted(e, t) {
        e.addEventListener("click", () => {
            let o = t.value;
            if (!o)
                return;
            let n = document.createElement("textarea");
            n.value = o,
            document.body.appendChild(n),
            n.select(),
            document.execCommand("copy"),
            document.body.removeChild(n),
            D.msgSuccess("复制成功")
        }
        )
    }
}
  , xe = {
    mounted(e, t) {
        let o = new IntersectionObserver(n => {
            n.forEach(u => {
                u.isIntersecting && (t.value(),
                o.disconnect())
            }
            )
        }
        ,{
            threshold: .5
        });
        o.observe(e)
    }
};
function Te(e) {
    e.directive("copyText", ke),
    e.directive("intersect", xe)
}
const k = {
    503: "请求过于频繁，请稍后再试~",
    default: "系统未知错误，请反馈给管理员"
};
function Me(e, t) {
    const o = x.KEYUTIL.getKey(t)
      , n = new x.KJUR.crypto.Signature({
        alg: "SHA256withRSA"
    });
    return n.init(o),
    n.updateString(e),
    x.hextob64(n.sign())
}
t1.defaults.headers["Content-Type"] = "application/json;charset=UTF-8";
let j = t1.create({
    baseURL: "/lcxp-platService",
    transformRequest: [function(e) {
        return typeof e == "object" ? JSON.stringify(e) : e
    }
    ]
});
j.interceptors.request.use(e => {
    var t;
    if (((t = e.headers.repeatSubmit) != null ? t : !0) && (e.method === "post" || e.method === "put")) {
        let n = {
            url: e.url,
            data: typeof e.data == "object" ? JSON.stringify(e.data) : e.data,
            time: new Date().getTime()
        }
          , u = JSON.parse(sessionStorage.getItem("sessionObj"));
        if (u == null || u === "")
            sessionStorage.setItem("sessionObj", JSON.stringify(n));
        else {
            let i = u.url
              , r = u.data
              , l = u.time
              , a = 1e3;
            if (r === n.data && n.time - l < a && i === n.url) {
                let c = "数据正在处理，请勿重复提交";
                return console.warn(`[${i}]: ` + c),
                Promise.reject(new Error(c))
            } else
                sessionStorage.setItem("sessionObj", JSON.stringify(n))
        }
    }
    if (e.method == "post") {
        let n = E().licenseStr;
        if (n) {
            let u = e.data
              , i = JSON.stringify(u)
              , r = Me(i, n);
            e.headers.signature = r
        }
    }
    return e
}
, e => Promise.reject(e));
j.interceptors.response.use(async e => {
    var t, o, n;
    let u = (t = e.data) != null ? t : {};
    if (e.request.responseType === "blob" || e.request.responseType === "arraybuffer") {
        let i = e.headers["content-type"];
        if (i.includes("application/json")) {
            let r = ""
              , l = new Blob([u])
              , a = (o = JSON.parse(await l.text())) != null ? o : {};
            return r = a.msg || a.message || k.default,
            D.msgError(r),
            Promise.reject(r)
        } else {
            let r = {
                data: u,
                fileName: "",
                type: i
            }
              , l = e.headers["content-disposition"];
            if (l) {
                let a = l.split("=")[1];
                r.fileName = decodeURIComponent(a)
            }
            return Promise.resolve(r)
        }
    } else {
        let i = (n = u.code) != null ? n : 200
          , r = u.msg || u.message || k.default;
        return i == 200 ? Promise.resolve(u) : (D.msgError(r),
        Promise.reject(r))
    }
}
, e => {
    var t, o;
    let n = (t = e.response) != null ? t : {}
      , u = k[n.status] || e.message || k.default
      , i = (o = e.config) != null ? o : {};
    if (n.status === 509) {
        let r = n.data
          , a = new DOMParser().parseFromString(r, "text/html")
          , c = a.body.querySelector("#baseUrl");
        c && c.setAttribute("value", location.origin + i.baseURL);
        let L = `<!DOCTYPE html>${a.documentElement.outerHTML}`
          , C = new Blob([L],{
            type: "text/html"
        })
          , s1 = URL.createObjectURL(C)
          , U = 560
          , H = 400
          , l1 = (window.innerWidth - U) / 2
          , a1 = (window.innerHeight - H) / 2;
        return window.open(s1, "_blank", `height=${H},width=${U},left=${l1},top=${a1}`),
        Promise.reject(e)
    } else
        u == "Network Error" ? u = "连接异常" : u.includes("timeout") ? u = "请求超时" : u.includes("Request failed with status code") && (u = "系统接口" + u.substr(u.length - 3) + "异常");
    return D.msgError(u),
    Promise.reject(e)
}
);
function Ie(e) {
    return j({
        url: "/product/getInitData",
        method: "post",
        data: e
    })
}
V.configure({
    showSpinner: !1
});
Z.beforeEach( (e, t, o) => {
    e.path != t.path && V.start(),
    E().licenseStr ? o() : Ie({}).then(n => {
        let u = n.data;
        u.length && (E().setLicenseStr(u),
        o())
    }
    ).catch(n => {
        console.error(n),
        o()
    }
    )
}
);
Z.afterEach(e => {
    e.meta.title && z().setTitle(e.meta.title),
    V.done()
}
);
console.log = function() {}
;
let y = Q(Z1);
y.use(j1);
y.use(Z);
y.use(Se);
y.use(Te);
y.use(R1);
y.config.errorHandler = (e, t, o) => {
    let n = e.message || o;
    console.error("全局异常拦截：" + n),
    r1.closeProgress()
}
;
y.mount("#app");
export {B as _, r1 as a, D as m, De as p, u1 as r, j as s};
