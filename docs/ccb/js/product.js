// var bitmap = toolkit.getCookie('m_user_bitmap'),
//     cs_cid = toolkit.getCookie('cs_cid'),
//     white_list = ["474589801", "1128982632", "1238894214", "1112546989", "37573018", "1190792393", "55566967", "52987927", "102764920", "877850672", "1224666904", "186531469", "110164847", "1216971324", "1127542948", "510058515", "1183837120", "452284365", "20424909", "1164664937", "1164456668", "1189366805", "1179200817", "1205419183", "1201274276", "50382524", "1147568427", "1260796771", "1130701785", "20757876", "340464051", "65029411", "74495930", "21162093", "1255537999", "213874304", "1128657497", "1166544548", "413752765", "380881458", "1231502702", "211367932", "23177573", "191810530", "343668479", "164597739", "235393781", "129047540", "151067063", "1066485773", "25468519", "1070848526", "253262076", "928787342", "1176652074", "133993669", "16083494", "173493020", "9850421", "11515285", "420767310", "41269955", "162760212", "1181053735", "1174924305", "1254583788", "240545141", "176096984"],
//     isEnable = bitmap && bitmap[9] === "1" || cs_cid && ~white_list.indexOf(cs_cid)
// if (!isEnable) location.href = ~location.pathname.indexOf("mobilev3") ? "/cn/home/indexv3m.html" : "/cn/home/indexv3.html"

var BuyHost$1 = 'https://b2b.ccb.com', // "",
  BuyHost$2 = 'https://ibsbjstar.ccb.com.cn', // "https://ibsbjstar.ccb.com.cn",
  BuyHost$3 = 'https://b2b.ccb.com'; //"https://b2b.ccb.com";

var ProductTool = {
  purchaseAmount: function (product) {
    var amount = +product.Txn_Num_GRP[0].Per_Txn_LwrLmtAmt;
    return +(amount >= 10000 ? amount / 10000 : amount.toFixed(2));
  },
  currencyUnit: function (product) {
    var amount = +product.Txn_Num_GRP[0].Per_Txn_LwrLmtAmt;
    return (
      (amount >= 10000 ? '万' : '') + ProductDataMap.currency[product.CcyCd]
    );
  },
  timeFormat: function (timeString, schema) {
    if (!timeString) return '';
    return timeString.replace(/(\d{2})(\d{2})(\d{2})/, schema || '$1:$2');
  },
  dateFormat: function (dateString, separator) {
    if (!dateString) return '';
    separator = separator || '-';
    return dateString.replace(
      /(\d{4})(\d{2})(\d{2})/,
      ['$1', '$2', '$3'].join(separator),
    );
  },
  timelineDateFormat: function (dateString, separator) {
    if (!dateString) return dateString;
    separator = separator || '-';
    var nowYear = new Date().getFullYear(),
      dateYear = dateString.toDate('yyyyMMdd').getFullYear();
    if (nowYear === dateYear) {
      return dateString.replace(
        /(\d{4})(\d{2})(\d{2})/,
        ['$2', '$3'].join(separator),
      );
    } else {
      return dateString.replace(
        /(\d{4})(\d{2})(\d{2})/,
        ['$1', '$2', '$3'].join(separator),
      );
    }
  },
  getChartTypes: function (product) {
    var chartTypeIdsOfMainTab = null,
      Prod_Sel_GRP = product.Prod_Sel_GRP,
      isT0 =
        Prod_Sel_GRP &&
        ~Prod_Sel_GRP.findIndex(function (sel) {
          return sel.Stk_TpCd == '1';
        }) &&
        product.Pcs_Mode == 3;

    if (product.Rlz_Cnd_ID == '1') {
      chartTypeIdsOfMainTab = ['07', '09', '17'];
    } else if (isT0) {
      chartTypeIdsOfMainTab = ['01'];
    } else {
      var Fnd_Clsd_Opn_TpCd = product.Fnd_Clsd_Opn_TpCd,
        openTypeNm = ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[Fnd_Clsd_Opn_TpCd];

      chartTypeIdsOfMainTab = {
        定期开放式: ['07', '09', '16', 'B'],
        封闭式: ['07', '09'],
        最低开放式: ['07', '09', 'B'],
        按日开放: ['07', '09', 'B'],
        日申周赎: ['07', '09', 'B'],
        净值归一: ['01', '15'],
      }[openTypeNm];
    }

    return (
      chartTypeIdsOfMainTab &&
      chartTypeIdsOfMainTab.map(function (chartTypeId) {
        return { name: ProductDataMap.ChartType[chartTypeId], id: chartTypeId };
      })
    );
  },
  buyTimeDesc: function (product) {
    var timeFormat = ProductTool.timeFormat,
      dateFormat = ProductTool.dateFormat;

    if (product.Rlz_Cnd_ID == '1')
      return (
        '工作日' +
        timeFormat(product.StTm) +
        '-' +
        timeFormat(product.EdTm) +
        '可购买'
      );

    var openTypeNm =
        ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[product.Fnd_Clsd_Opn_TpCd],
      isPrivate = ProductTool.isPrivate(product);

    return {
      定期开放式:
        '最近开放期：' +
        [
          dateFormat(product.Ivs_StDt, '/'),
          timeFormat(product.PROM_TIME_A),
          '-',
          dateFormat(
            isPrivate ? product.ChrgFee_Cyc_StDt : product.Ivs_CODt,
            '/',
          ),
          timeFormat(product.PROM_TIME_B),
        ].join(' '),
      封闭式:
        '产品可募集时间：' +
        [
          dateFormat(product.Ivs_StDt, '/'),
          timeFormat(product.PROM_TIME_A),
          '-',
          dateFormat(
            isPrivate ? product.ChrgFee_Cyc_StDt : product.Rs_EdDt,
            '/',
          ),
          timeFormat(product.PROM_TIME_B),
        ].join(' '),
      最低开放式:
        '工作日' +
        timeFormat(product.StTm) +
        '-' +
        timeFormat(product.EdTm) +
        '可购买',
      按日开放:
        '工作日' +
        timeFormat(product.StTm) +
        '-' +
        timeFormat(product.EdTm) +
        '可购买',
      日申周赎:
        '工作日' +
        timeFormat(product.StTm) +
        '-' +
        timeFormat(product.EdTm) +
        '可购买',
      净值归一:
        '工作日' +
        timeFormat(product.StTm) +
        '-' +
        timeFormat(product.EdTm) +
        '可购买',
    }[openTypeNm];
  },
  investTerm: function (product) {
    if (product.Rlz_Cnd_ID == '1') return '周期滚动型';
    var openTypeNm =
      ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[product.Fnd_Clsd_Opn_TpCd];
    return {
      定期开放式: product.LCS_Cd,
      封闭式:
        product.Ivs_Trm && product.Ivs_Trm < 20000
          ? '封闭' + product.Ivs_Trm + '天'
          : '无固定期限',
      最低开放式: '最低持有' + product.ChnBnd_Bsn_Trm + '天',
      按日开放: '按日申赎',
      日申周赎:
        [
          '日申日赎',
          '日申周赎',
          '日申双周赎',
          '日申月赎',
          '日申季赎',
          '日申半年赎',
          '日申年赎',
          '日申其他赎',
        ][product.Txn_Cyc_s_Val] || '日申周赎',
      净值归一: '按日申赎',
    }[openTypeNm];
  },
  rateRound: function (rate) {
    return rate.replace(/^\s*(-?\d+\.\d{2,})%\s*$/, function (match, number) {
      return (Math.round(+number * 100) / 100).toFixed(2) + '%';
    });
  },
  depositBuyParam: function (product, Bkstg_PD_Tp_ECD) {
    var params = {
      F_TXCODE: 'JGCK00',
      FUNC_NO: '0',
      PRCT_CDE: product.IvsmPd_ECD,
      PRCT_PRD: product.Ivs_Trm,
      INDI_MIN_AMT: product.Txn_Num_GRP[0].Per_Txn_LwrLmtAmt,
      INDI_STEP_AMT: product.Txn_Num_GRP[0].SpLn_Val,
      PRCT_TYP: product.Bkstg_PD_Tp_ECD,
      PROVINCE_ID: product.Sale_Inst_ECD_GRP.map(function (o) {
        return o.Txn_BO_ID;
      }).join('|'),
      Txn_Mkt_ID: product.Txn_Mkt_ID,
      CshEx_Cd: product.CshEx_Cd,
      SURVIVING_FLAG: product.Rlz_Cnd_ID,
      PD_FOR_SYS_ID: product.Eclsv_Stm_ECD,
      ChrgFee_Cyc_StDt: product.ChrgFee_Cyc_StDt,
      ChrgFee_Cyc_EdDt: product.ChrgFee_Cyc_EdDt,
      ORG_TX: product.Prod_Func_GRP[0].PD_Fcn_Cd,
    };

    return $.param({
      ccbParam: Object.keys(params)
        .map(function (key) {
          return key + '=' + params[key];
        })
        .join(','),
    });
  },
  buyParam: function (
    product,
    PD_Sl_Obj_Cd,
    FndCo_Agnc_Sale_InsID,
    Crt_Chnl_ID,
    Stk_TpCd,
    Bkstg_PD_Tp_ECD,
  ) {
    return $.param({
      PD_Fcn_Cd: product.Prod_Func_GRP[0].PD_Fcn_Cd,
      IvsmPd_ECD: product.IvsmPd_ECD,
      Per_Txn_LwrLmtAmt: product.Txn_Num_GRP[0].Per_Txn_LwrLmtAmt,
      SpLn_Val: product.Txn_Num_GRP[0].SpLn_Val,
      Ivs_Trm: ProductTool.investTerm(product),
      Stk_TpCd: Stk_TpCd,
      CcyCd: product.CcyCd,
      Rlz_Cnd_ID: product.Rlz_Cnd_ID,
      Unit_Ast_NetVal: product.Unit_Ast_NetVal
        ? product.Unit_Ast_NetVal
        : void 0,
      Txn_Mkt_ID: product.Txn_Mkt_ID,
      PD_Sl_Obj_Cd: PD_Sl_Obj_Cd,
      FndCo_Agnc_Sale_InsID: FndCo_Agnc_Sale_InsID,
      Txn_BO_ID: product.Sale_Inst_ECD_GRP.map(function (o) {
        var Txn_BO_ID = o.Txn_BO_ID.substr(0, 3);
        Txn_BO_ID === '999' && (Txn_BO_ID = '000');
        return Txn_BO_ID;
      }).join(','),
      CshEx_Cd: product.CshEx_Cd,
      Crt_Chnl_ID: Crt_Chnl_ID,
      Bkstg_PD_Tp_ECD: Bkstg_PD_Tp_ECD,
      Fnd_Clsd_Opn_TpCd: product.Fnd_Clsd_Opn_TpCd,
    });
  },
  buyInfo: function (product) {
    var nowDate = new Date().parse('yyyyMMdd'),
      nowTime = new Date().parse('hhmmss'),
      Rs_StDt = product.Rs_StDt,
      Rs_EdDt = product.Rs_EdDt,
      Ivs_StDt = product.Ivs_StDt,
      Ivs_CODt = product.Ivs_CODt,
      ChrgFee_Cyc_StDt = product.ChrgFee_Cyc_StDt,
      PROM_TIME_A = product.PROM_TIME_A,
      PROM_TIME_B = product.PROM_TIME_B,
      StTm = product.StTm,
      EdTm = product.EdTm,
      openTypeNm =
        ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[product.Fnd_Clsd_Opn_TpCd],
      PD_Fcn_Cd_Name = ProductDataMap.PD_Fcn_Cd_Name,
      status = product.Prod_Func_GRP.reduce(function (status, item) {
        status[PD_Fcn_Cd_Name[item.PD_Fcn_Cd]] = true;
        return status;
      }, {}),
      isPrivate = ProductTool.isPrivate(product);

    if (product.SplLmt !== '' && product.SplLmt <= 0) return BuyInfo('售罄', 0);
    if (status['预约']) return BuyInfo('购买', 0);
    if (status['认购']) {
      return nowDate >= Rs_StDt &&
        nowDate <= Rs_EdDt &&
        nowTime >= PROM_TIME_A &&
        nowTime <= PROM_TIME_B
        ? BuyInfo('购买', 1)
        : BuyInfo('购买', 0);
    }
    if (status['申购']) {
      return {
        定期开放式: isPrivate
          ? nowDate >= Ivs_StDt &&
            nowDate <= ChrgFee_Cyc_StDt &&
            nowTime >= PROM_TIME_A &&
            nowTime <= PROM_TIME_B
          : nowDate >= Ivs_StDt &&
            nowDate <= Ivs_CODt &&
            nowTime >= PROM_TIME_A &&
            nowTime <= PROM_TIME_B,
        封闭式: isPrivate
          ? nowDate >= Rs_StDt &&
            nowDate <= ChrgFee_Cyc_StDt &&
            nowTime >= PROM_TIME_A &&
            nowTime <= PROM_TIME_B
          : nowDate >= Rs_StDt &&
            nowDate <= Rs_EdDt &&
            nowTime >= PROM_TIME_A &&
            nowTime <= PROM_TIME_B,
        最低开放式: nowTime >= StTm && nowTime <= EdTm,
        按日开放: nowTime >= StTm && nowTime <= EdTm,
        日申周赎: nowTime >= StTm && nowTime <= EdTm,
        净值归一: nowTime >= StTm && nowTime <= EdTm,
      }[openTypeNm]
        ? BuyInfo('购买', 1)
        : BuyInfo('购买', 0);
    }
    return BuyInfo('购买', 0);

    function BuyInfo(name, state) {
      return { name: name, state: !!state };
    }
  },
  isPrivate: function (product) {
    return (
      product.Rcmm_Txn.some(function (o) {
        return o.Rcmm_Txn_TpCd == '02';
      }) &&
      product.ChrgFee_Cyc_StDt &&
      product.PROM_TIME_B
    );
  },
};

var ProductDataMap = {
  PD_Fcn_Cd_Name: {
    1: '预约',
    2: '认购',
    3: '申购',
    0: '所有',
  },
  Fnd_Clsd_Opn_TpCd_Name: {
    1: '定期开放式',
    2: '封闭式',
    3: '最低开放式',
    4: '按日开放',
    6: '日申周赎',
    7: '净值归一',
  },
  ChartType: {
    '01': '七日年化',
    '07': '成立以来年化收益率',
    '09': '单位净值',
    15: '万份收益',
    16: '往期业绩',
    17: '周期收益',
    B: '区间收益',
    X: '过往业绩', // 20240426 没有后端备份的映射关系，NLCQ58
  },
  ChartValueFormatter: {
    '01': function (val) {
      return Number(val * 100).toFixed(2);
    },
    '07': function (val) {
      return Number(val * 100).toFixed(2);
    },
    '09': function (val) {
      return val;
    },
    15: function (val) {
      return val;
    },
    16: function (val) {
      return Number(val * 100).toFixed(2);
    },
    17: function (val) {
      return Number(val * 100).toFixed(2);
    },
    B: function (val) {
      return Number(val * 100).toFixed(2);
    },
  },
  ChartValueUnit: {
    '01': '%',
    '07': '%',
    '09': '',
    15: '',
    16: '%',
    17: '%',
    B: '%',
  },
  currency: {
    156: '元',
    840: '美元',
    344: '港币',
    978: '欧元',
    826: '英镑',
    '036': '澳大利亚元',
  },
  Rsk_Grd_Cd: {
    '01': 'R1低风险',
    '02': 'R2中低风险',
    '03': 'R3中风险',
    '04': 'R4中高风险',
    '05': 'R5高风险',
  },
  Pft_Pcsg_Mod: {
    1: '详见说明书',
    2: '上一运作周期年化收益率',
    3: '七日年化收益率',
    4: '近1月年化收益率',
    5: '近3月年化收益率',
    6: '近6月年化收益率',
    7: '近1年年化收益率',
    8: '当年年化收益率',
    9: '成立以来年化收益率',
    a: '业绩比较基准',
    1001: '近1个会计年度收益率',
    1002: '近2个会计年度收益率',
    1003: '近3个会计年度收益率',
    1004: '近4个会计年度收益率',
    1005: '近5个会计年度收益率',
    1006: '近1周年化收益率',
    1007: '近2周年化收益率',
    1008: '近3周年化收益率',
    1009: '近2个月年化收益率',
    1010: '近4个月年化收益率',
    1011: '近5个月年化收益率',
    1012: '成立以来涨跌幅',
    1013: '近1个会计年度涨跌幅',
    1014: '近2个会计年度涨跌幅',
    1015: '近3个会计年度涨跌幅',
    1016: '近4个会计年度涨跌幅',
    1017: '近5个会计年度涨跌幅',
    1018: '近1周涨跌幅',
    1019: '近2周涨跌幅',
    1020: '近3周涨跌幅',
    1021: '近1个月涨跌幅',
    1022: '近2个月涨跌幅',
    1023: '近3个月涨跌幅',
    1024: '近4个月涨跌幅',
    1025: '近5个月涨跌幅',
    1026: '近6个月涨跌幅',
    1027: '当前未结束周期',
    1028: '历史完整周期',
    1029: '过往平均收益率',
    1030: '过往最好收益率',
    1031: '过往最差收益率',
    1032: '过往平均年化收益率',
    1033: '过往最好年化收益率',
    1034: '过往最差年化收益率',
    1036: '近2年年化收益率',
    1037: '近3年年化收益率',
    1038: '近1年涨跌幅',
    1039: '近2年涨跌幅',
    1040: '近3年涨跌幅',
  },
  Pft_Pcsg_Mod_Tips: {
    3: '七日年化收益率为本产品最近七日（含节假日）收益率所折算的年化产品收益率。可以作为近期盈利水平的参考，但不能完全代表该理财产品的实际收益率',
    4: '指本次报价和对应时间内报价的年化收益（四舍五入之后，保留两位小数），赎回成本未计入。而非最终持有到期的收益率。以近一个月年化收益率为例，等于（本次报价-30日前报价）/30日前报价/两次报价日期差*365。理财计划净值披露的时间间隔以实际产品说明书约定为准',
    5: '指本次报价和对应时间内报价的年化收益（四舍五入之后，保留两位小数），赎回成本未计入。而非最终持有到期的收益率。以近一个月年化收益率为例，等于（本次报价-30日前报价）/30日前报价/两次报价日期差*365。理财计划净值披露的时间间隔以实际产品说明书约定为准',
    6: '指本次报价和对应时间内报价的年化收益（四舍五入之后，保留两位小数），赎回成本未计入。而非最终持有到期的收益率。以近一个月年化收益率为例，等于（本次报价-30日前报价）/30日前报价/两次报价日期差*365。理财计划净值披露的时间间隔以实际产品说明书约定为准',
    7: '指本次报价和对应时间内报价的年化收益（四舍五入之后，保留两位小数），赎回成本未计入。而非最终持有到期的收益率。以近一个月年化收益率为例，等于（本次报价-30日前报价）/30日前报价/两次报价日期差*365。理财计划净值披露的时间间隔以实际产品说明书约定为准',
    8: '指当年1月1日起至最新净值估值日（含该日）对应的折算年化收益率',
    9: '成立以来年化收益率是从产品发布之日的产品净值到当前的产品净值换算成的年化收益率。成立以来年化（%）=（1+净值增长率）^(365/区间天数)-1。其中，净值增长率为最新净值较认购净值1.0000的增长幅度，区间天数为自成立日（含该日）起至最新净值估值日（含该日）累计运作天数（成立以来年化采用四舍五入）',
    a: '指理财计划管理人基于过往投资经验及对产品存续期投资市场波动的预判而对本产品所设定的投资目标，业绩比较基准不代表本产品的未来表现和实际收益，也不构成对本产品未来任何的收益承诺。',
  },
  Pft_Pcsg_Mod_Tips_Code: {
    '0JH': {
      month_year_Pft: [4, 5, 6, 1009, 1010, 1011],
      month_Chg: [1021, 1022, 1023, 1024, 1025, 1026],
      week_year_Pft: [1006, 1007, 1008],
      week_Chg: [1018, 1019, 1020],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      recent_year_Pft_Chg: [7, 1036, 1037, 1038, 1039, 1040],
    },
    '0EW': {
      month_year_Pft: [4, 5, 6, 1009, 1010, 1011],
      month_Chg: [1021, 1022, 1023, 1024, 1025, 1026],
      week_year_Pft: [1006, 1007, 1008],
      week_Chg: [1018, 1019, 1020],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
    },
    '0MS': {
      month_year_Pft: [4, 5, 6],
      month_Chg: [1021, 1023, 1026],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      recent_year_Pft_Chg: [7, 1036, 1037, 1038, 1039, 1040],
    },
    '0LNY': {
      month_year_Pft: [4, 5, 6, 1009, 1010, 1011],
      month_Chg: [1021, 1022, 1023, 1024, 1025, 1026],
      week_year_Pft: [1006, 1007, 1008],
      week_Chg: [1018, 1019, 1020],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      recent_year_Pft_Chg: [7, 1036, 1037, 1038, 1040],
    },
    '0PAWM': {
      month_year_Pft: [4, 5, 6],
      month_Chg: [1021, 1023, 1026],
      week_year_Pft: [1006, 1007, 1008],
      week_Chg: [1018, 1019, 1020],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      recent_year_Pft_Chg: [7, 1037, 1038, 1040],
    },
    '0Y05': {
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
    },
    '0ZY1': {
      month_year_Pft: [4, 5, 6],
      month_Chg: [1021, 1023, 1026],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      recent_year_Pft: [7, 1036, 1037],
      recent_year_Chg: [1038, 1039, 1040],
    },
    '0PWM': {
      month_year_Pft: [4, 5, 6, 1009],
      month_Chg: [1021, 1022, 1023, 1026],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      recent_year_Pft: [7, 1036, 1037],
      recent_year_Chg: [1038, 1039, 1040],
    },
    '0Y88': {
      month_year_Pft: [4, 5, 6],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
    },
    '0Y3': {
      month_year_Pft: [4, 5, 6],
      month_Chg: [1021, 1023, 1026],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      recent_year_Pft_Chg: [7, 1036, 1037, 1038, 1039, 1040],
    },
    '0YZX': {
      month_year_Pft: [3, 4, 5, 6, 9, 1027, 1028],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      Chg: [1012, 1013, 1014, 1015, 1016, 1017, 1021, 1023, 1026],
      recent_year_Pft_Chg: [7, 1036, 1037, 1038, 1039, 1040],
    },
    '066': {
      month_year_Pft: [4, 5, 6],
      month_Chg: [1021, 1023, 1026],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
    },
    '0Y4': {},
    '0BK': {
      month_year_Pft: [4, 5, 6],
      month_Chg: [1021, 1023, 1026],
      fiscal_year_Pft: [1001, 1002, 1003, 1004, 1005],
      fiscal_year_Chg: [1013, 1014, 1015, 1016, 1017],
      recent_year_Pft_Chg: [7, 1036, 1037, 1038, 1039, 1040],
    },
  },
  '0JH': {
    1: '详见说明书',
    2: '',
    3: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">七日年化收益率</div>\
        ①七日年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image005.gif"><br/>\
        ②万份收益型产品7日年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image006.gif">*100%<br/>\
        Ri指最近第i个自然日的万份收益（i=1,2,3…7）<br/>\
        万份收益=当日理财产品已实现收益/当日理财产品总份额*10000',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益</div>\
        ①初始净值为1<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image001.gif"><br/>\
        ②初始净值不为1（适用于产品成立一段时间后新发的子份额）<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image002.gif"><br/>\
        t2为子份额上线日期。<br/>\
        ③万份收益型产品<br/>\
        成立以来年化收益=<img src="/cn/finance/products/images/licai/formula/JH/image003.gif">*100%<br/>\
        Ri指成立以来至最近一个自然日区间每个自然日的万份收益。R1指成立日当日的万份收益，RN指最近一个自然日的万份收益。N=最近一个自然日-成立日期+1。<br/>\
        ',
    a: '指理财产品管理人基于过往投资经验及对产品存续期投资市场波动的预判所设定的投资目标，业绩比较基准不是预期收益率，不代表产品未来的表现和实际收益，不构成对产品收益的承诺。具体以产品说明书为准。',
    1012: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        ①初始净值为1<br/>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image009.gif"><br/>\
        ②初始净值不为1（适用于产品成立一段时间后新发的子份额）<br/>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image010.gif"><br/>\
        t2为子份额上线日期。\
        ',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">当前未结束周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image014.gif"><br/>\
        ',
    1028: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">历史完整周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image015.gif"><br/>\
        ',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '指产品自成立后所实现的最高年化收益率。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b>',
    1034: '指产品自成立后所实现的最低年化收益率。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b>',
    month_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N月年化收益率</div>\
        近N月年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image008.gif">',
    month_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个月涨跌幅</div>\
        近N月区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image013.gif">',
    week_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N周年化收益率</div>\
        近N周年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image007.gif"></img>',
    week_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N周涨跌幅</div>\
        近N周区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image012.gif">',
    fiscal_year_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度涨跌幅</div>\
        完整会计年度区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image011.gif">',
    fiscal_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度收益</div>\
        完整会计年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image004.gif">',
    recent_year_Pft_Chg:
      '<div style="text-align: center;">基本规则</div>\
        基本规则<br/>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        近N年年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image016.gif"><br/>\
        ',
  },
  '0EW': {
    1: '详见说明书',
    2: '',
    3: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">七日年化收益率</div>\
        ①七日年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image005.gif"><br/>\
        ②万份收益型产品7日年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image006.gif">*100%<br/>\
        Ri指最近第i个自然日的万份收益（i=1,2,3…7）<br/>\
        万份收益=当日理财产品已实现收益/当日理财产品总份额*10000',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益</div>\
        ①初始净值为1<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image001.gif"><br/>\
        ②初始净值不为1（适用于产品成立一段时间后新发的子份额）<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image002.gif"><br/>\
        t2为子份额上线日期。<br/>\
        ③万份收益型产品<br/>\
        成立以来年化收益=<img src="/cn/finance/products/images/licai/formula/JH/image003.gif">*100%<br/>\
        Ri指成立以来至最近一个自然日区间每个自然日的万份收益。R1指成立日当日的万份收益，RN指最近一个自然日的万份收益。N=最近一个自然日-成立日期+1。<br/>\
        ',
    a: '指理财产品管理人基于过往投资经验及对产品存续期投资市场波动的预判所设定的投资目标，业绩比较基准不是预期收益率，不代表产品未来的表现和实际收益，不构成对产品收益的承诺。具体以产品说明书为准。',
    1012: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        ①初始净值为1<br/>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image009.gif"><br/>\
        ②初始净值不为1（适用于产品成立一段时间后新发的子份额）<br/>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image010.gif"><br/>\
        t2为子份额上线日期。\
        ',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">当前未结束周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image014.gif"><br/>\
        ',
    1028: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">历史完整周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image015.gif"><br/>\
        ',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '指产品自成立后所实现的最高年化收益率。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b>',
    1034: '指产品自成立后所实现的最低年化收益率。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b>',
    month_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N月年化收益率</div>\
        近N月年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image008.gif">',
    month_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个月涨跌幅</div>\
        近N月区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image013.gif">',
    week_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N周年化收益率</div>\
        近N周年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image007.gif"></img>',
    week_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N周涨跌幅</div>\
        近N周区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image012.gif">',
    fiscal_year_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度涨跌幅</div>\
        完整会计年度区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/JH/image011.gif">',
    fiscal_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度收益</div>\
        完整会计年化收益率=<img src="/cn/finance/products/images/licai/formula/JH/image004.gif">',
  },
  '0ZY1': {
    1: '详见说明书',
    2: '',
    3: '<div style="text-align: center;">基本规则</div>\
        七日年化收益率指该产品（份额）最新净值和该产品（份额）前7日净值的区间年化收益率，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②仅适用于现金理财产品。<br/>\
        ③收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ④赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑤<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">七日年化收益率</div>\
        ①七日年化收益率（现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image007.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/ZY1/image003.gif">指最近第i个自然日的万份收益，i=1,2,3…7；万份收益=当日理财产品已实现收益/当日理财产品总份额*10000。<br/>\
        ',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '<div style="text-align: center;">基本规则</div>\
        成立以来年化收益率指该产品（份额）最新净值日和对应产品（份额）成立日的区间年化收益率，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②计算区间为对应产品（份额）初始日至该产品（份额）最新净值日期的自然天数。<br/>\
        ③收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ④赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑤若非现金产品（份额）成立未满1个月，则不计算本收益指标。<br/>\
        ⑥<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益率</div>\
        ①非现金产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/ZY1/image001.gif"><br/>\
        T1为该产品（份额）最新净值日，T2为产品成立日或份额首次有申购确认的净值日，初始累计单位净值为1（适用于新发产品）或份额首次有申购确认的累计净值（适用于追加份额）。<br/>\
        ②现金产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/ZY1/image002.gif"><br/>\
        i=1,2,...,N，Π代表连乘，<img src="/cn/finance/products/images/licai/formula/ZY1/image003.gif">指成立以来至最近一个自然日区间每个自然日的万份收益。<img src="/cn/finance/products/images/licai/formula/ZY1/image004.gif">指产品成立日当日的万份收益（适用于新发产品）或份额首次有申购确认的万份收益，<img src="/cn/finance/products/images/licai/formula/ZY1/image005.gif">指最近一个自然日的万份收益。N=最近一个自然日-成立日期+1；万份收益=当日理财产品已实现收益/当日理财产品总份额*10000。<br/>\
        ',
    a: '指管理人基于过往投资经验及对产品存续期投资市场波动的预判而对本产品所设定的投资目标，业绩比较基准不是预期收益率，不代表本产品的未来表现和实际收益，或投资管理人对本产品进行的收益承诺。',
    1012: '<div style="text-align: center;">基本规则</div>\
        成立以来涨跌幅指该产品（份额）最新净值日和对应产品（份额）成立日的涨跌幅，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②计算区间为对应产品（份额）初始日至该产品（份额）最新净值日的自然天数。<br/>\
        ③涨跌幅采用相应时间区间内的绝对涨跌幅，非年化数据。<br/>\
        ④收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ⑤赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑥若非现金产品（份额）成立未满1个月，则不计算本收益指标。<br/>\
        ⑦<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        ①成立以来涨跌幅（非现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image006.gif"><br/>\
        初始累计单位净值为1（适用于新发产品）或份额首次有申购确认的累计净值（适用于追加份额）<br/>\
        ',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        近N个月的年化收益率指该产品（份额）最新净值日和对应产品（份额）时间内的区间年化收益率，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②计算近N月过往业绩时，对日指与最新净值日的对日。例如，近6月，指2023年6月21日-2023年12月21日。<br/>\
        ③计算近N月过往业绩时，若N月前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ⑤赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑥<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个月年化收益率</div>\
        ①近N月年化收益率（非现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image008.gif"><br/>\
        T1为该产品（份额）的最新净值日，T2为该产品（份额）N月前对日。<br/>\
        ②近N月年化收益率（现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image002.gif"><br/>\
        i=1,2,...,N，Π代表连乘，<img src="/cn/finance/products/images/licai/formula/ZY1/image010.gif">指成该时间区间每个自然日的万份收益。<img src="/cn/finance/products/images/licai/formula/ZY1/image011.gif">指N月前对日后一个自然日的万份收益，<img src="/cn/finance/products/images/licai/formula/ZY1/image012.gif">指最近一个自然日的万份收益，N=最近一个自然日-N月前对日后一个自然日+1；万份收益=当日理财产品已实现收益/当日理财产品总份额*10000。<br/>\
        ',
    month_Chg:
      '<div style="text-align: center;">基本规则</div>\
        近N个月涨跌幅指该产品（份额）最新净值日和对应时间内的涨跌幅，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②计算近N月涨跌幅时，对日指与最新的净值日对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N月涨跌幅时，若N月前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日为2023年12月18日，计算近1个月涨跌幅时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④涨跌幅采用相应时间区间内的绝对涨跌幅，非年化数据。<br/>\
        ⑤收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ⑥赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑦<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个月涨跌幅</div>\
        近N月区间涨跌幅（非现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image013.gif"><br/>\
        ',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '<div style="text-align: center;">基本规则</div>\
        近N个会计年度涨跌幅指产品（份额）对应完整会计年度的涨跌幅，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②计算区间为当年1月1日至当年12月31日。<br/>\
        ③涨跌幅采用相应时间区间内的绝对涨跌幅，非年化数据。<br/>\
        ④收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ⑤赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑥<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度涨跌幅</div>\
        近N个会计年度涨跌幅（非现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image016.gif"><br/>\
        ',
    fiscal_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        近N个会计年度年化收益率指产品（份额）对应完整会计年度的区间年化收益率，具体计算规则如下：<br/>\
        ①采用产品累计单位净值计算。<br/>\
        ②计算区间为当年1月1日至当年12月31日。<br/>\
        ③收益指标保留百分比格式下的两位小数，四舍五入。<br/>\
        ④赎回成本未计入，并非最终持有到期的收益率。<br/>\
        ⑤<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度年化收益率</div><br/>\
        ①近N个会计年度收益率（非现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image014.gif"><br/>\
        N为XX年1月1日到XX年12月31日的自然天数。<br/>\
        ②近N个会计年度收益率（现金产品）=<img src="/cn/finance/products/images/licai/formula/ZY1/image015.gif"><br/>\
        i=1,2,...,N，Π代表连乘，N为XX年1月1日到XX年12月31日的自然天数，<img src="/cn/finance/products/images/licai/formula/ZY1/image010.gif">为XX年第i个自然日的万份收益；万份收益=当日理财产品已实现收益/当日理财产品总份额*10000。<br/>\
        ',
    recent_year_Pft:
      '非现金产品：<br/>\
        近N个月/年年化收益率指最新净值日和对应日的区间年化收益率，赎回成本未计入，并非最终持有到期的收益率。近N个月/年年化收益率=（期末累计净值-期初累计净值）/期初单位净值/区间天数*365*100%，其中，期初日期为最新净值日向前N月/年的对应日，如对应日期无公布的净值，则向前取最近一次公布的净值日期。期末日期为产品最新净值日。区间天数为期末日期至期初日期间的自然天数。收益率四舍五入后保留两位小数。若非现金产品运作未满1个月，则不计算本收益指标。理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。<br/>\
        现金产品：<br/>\
        近N个月/年年化收益率指最新收益日和对应日的区间年化收益率，赎回成本未计入，并非最终持有到期的收益率。近N个月/年年化收益率=【(1+R1/10000)*(1+R2/10000)*……*(1+Rn/10000)^(365/N)-1】*100%，其中R1为N月/年前对日后一个自然日的每万份收益，Rn为最近一个自然日的每万份收益，N=最近一个自然日-N月/年前对日后一个自然日+1。收益率四舍五入后保留两位小数。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>',
    recent_year_Chg:
      '非现金产品：<br/>\
        近N个月/年涨跌幅指最新净值日和对应日的净值涨跌幅，赎回成本未计入，并非最终持有到期的收益率。近N个月/年涨跌幅=（期末累计净值-期初累计净值）/期初单位净值*100%，其中，期初日期为最新净值日向前N月/年的对应日，如对应日期无公布的净值，则向前取最近一次公布的净值日期。期末日期为产品最新净值日。收益率四舍五入后保留两位小数。若非现金产品运作未满1个月，则不计算本收益指标。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>',
  },
  '0Y88': {
    1: '详见说明书',
    2: '',
    3: '<div style="text-align: center;">七日年化收益率</div>\
        七日年化收益率（仅限于现金类产品）=<img src="/cn/finance/products/images/licai/formula/Y88/image004.gif">*100%<br/>\
        Ri为最近第i 公历日每万份产品份额净收益<br/>\
        万份收益=当日理财产品已实现收益/当日理财产品总份额*10000',
    4: '',
    5: '',
    6: '',
    7: '近一年年化收益率（%）= (统计日的【累计单位净值】-基准日的【累计单位净值】)/基准日的【单位净值】/(统计日-基准日)*365*100%<br/>\
        统计日：取【统计日期】（含）之前最新可得的【累计单位净值】所对应的日期。<br/>\
        基准日：取【统计日期】的上年度对日与【产品成立单位净值日期】中更晚的日期。<br/>\
        （若该日期无【累计单位净值】，则取该日期之前最新可得【累计单位净值】所对应的日期）<br/>\
        ',
    8: '',
    9: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        计算成立以来年化收益率时，取产品首次有份额买入时的确认净值（包括认购及申购）及时点作为计算周期起点；以统计某业务数据项的截至日期（默认为该日日终的情况）作为区间终点。<br/>\
        <div style="text-align: center;">成立以来年化收益率</div>\
        成立以来年化收益率(%)=（统计日产品【累计单位净值】-【成立单位净值】）/【成立单位净值】/（统计日-基准日）*365*100%',
    a: '',
    1012: '',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    1038: '近一年涨跌幅（%）= (统计日的【累计单位净值】-基准日的【累计单位净值】)/基准日的【单位净值】*100%<br/>\
        统计日：取【统计日期】（含）之前最新可得的【累计单位净值】所对应的日期。<br/>\
        基准日：取【统计日期】的上年度对日与【产品成立单位净值日期】中更晚的日期。<br/>\
        （若该日期无【累计单位净值】，则取该日期之前最新可得【累计单位净值】所对应的日期）<br/>\
        ',
    month_year_Pft:
      '<div style="text-align: center;">近N个月年化收益率</div>\
        近1个月/3个月/6个月年化收益率（%）=(统计日的【累计单位净值】-基准日的【累计单位净值】)/基准日的【单位净值】/(统计日-基准日)*365*100%<br/>\
        基准日：取【统计日期】的1个月前/3个月前/6个月前对日与【产品成立单位净值日期】中更晚的日期；<br/>\
        ',
    month_Chg: '',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg: '',
    fiscal_year_Pft:
      '\
        计算完整会计年度收益率时，取产品上N年行情表数据中累计单位净值最大的【产品披露日期】作为统计日；取产品上N年行情表数据中累计单位净值最小的【产品披露日期】作为基准日。<br/>\
        <div style="text-align: center;">完整会计年度收益率</div>\
        净值型产品：(统计日的【累计单位净值】-基准日的【累计单位净值】)/基准日的【单位净值】/（统计日-基准日）*365*100%<br/>\
        现金类产品：<img src="/cn/finance/products/images/licai/formula/Y88/image002.gif">',
  },
  '0Y05': {
    1: '详见说明书',
    2: '',
    3: '现金管理产品：指以本产品最近七日（含节假日）收益率所折算的产品年化收益率。产品成立不满七日时以实际日收益率折算年收益率。<br/>\
        七日年化收益率（%）＝ <img src="/cn/finance/products/images/licai/formula/Y05/image001.png"><br/>\
        其中，Ri为最近第i个自然日(包括计算当日)的每万份理财产品已实现收益。<br/>\
        七日年化收益率采用截位保留至百分号内小数点后第2位。<br/>\
        净值型产品：指最新净值日期和对应时间内的区间年化收益，赎回成本未计入。并非最终持有到期收益率。7日年化收益率（%）=（1+（当前市值/7日前市值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前7日日期（或首个披露净值日期，不含该日）至当前净值日期（含该日）累计运作天数；（2）收益率截位后保留两位小数（3）市值体现净值波动和分红等情况，一般以净值（含分红）*10000来表示。（4）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    4: '指最新净值日期和对应时间内的区间年化收益，赎回成本未计入。并非最终持有到期收益率。近1月年化收益率（%）=（1+（当前市值/1月前市值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前1月日期（或首个披露净值日期，不含该日）至当前净值日期（含该日）累计运作天数；（2）收益率截位后保留两位小数；（3）市值体现净值波动和分红等情况，一般以净值（含分红）*10000来表示。（4）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    5: '指最新净值日期和对应时间内的区间年化收益，赎回成本未计入。并非最终持有到期收益率。近3月年化收益率（%）=（1+（当前市值/3月前市值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前3月日期（或首个披露净值日期，不含该日）至当前净值日期（含该日）累计运作天数；（2）收益率截位后保留两位小数；（3）市值体现净值波动和分红等情况，一般以净值（含分红）*10000来表示。（4）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    6: '指最新净值日期和对应时间内的区间年化收益，赎回成本未计入。并非最终持有到期收益率。近6月年化收益率（%）=（1+（当前市值/6月前市值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前6月日期（或首个披露净值日期，不含该日）至当前净值日期（含该日）累计运作天数；（2）收益率截位后保留两位小数；（3）市值体现净值波动和分红等情况，一般以净值（含分红）*10000来表示。（4）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    7: '近1年年化收益率（%）=（1+（当前复权单位净值/1年前复权单位净值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前1年日期（或首个披露的有效净值日期，不含该日）至当前最新披露的有效净值日期（含该日）累计运作天数；（2）复权单位净值体现单位净值序列及累计净值序列的波动和分红等情况。（3）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    8: '',
    9: '指最新净值日期和对应时间内的区间年化收益，赎回成本未计入。并非最终持有到期收益率。成立以来年化收益率（%）=（1+（当前市值/成立日市值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品成立日期（或首个披露净值日期，不含该日）至当前净值日期（含该日）累计运作天数；（2）收益率截位后保留两位小数；（3）市值体现净值波动和分红等情况，一般以净值（含分红）*10000来表示。（4）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    a: '',
    1012: '',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    1036: '近2年年化收益率（%）=（1+（当前复权单位净值/2年前复权单位净值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前2年日期（或首个披露的有效净值日期，不含该日）至当前最新披露的有效净值日期（含该日）累计运作天数；（2）复权单位净值体现单位净值序列及累计净值序列的波动和分红等情况。（3）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    1037: '近3年年化收益率（%）=（1+（当前复权单位净值/3年前复权单位净值-1）*100%）^（365/区间天数）-1。（1）区间天数为产品前3年日期（或首个披露的有效净值日期，不含该日）至当前最新披露的有效净值日期（含该日）累计运作天数；（2）复权单位净值体现单位净值序列及累计净值序列的波动和分红等情况。（3）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    1038: '计算展示日当天距向前追溯1年的日期之间的复权净值收益率；近1年涨跌幅=（当前复权单位净值/1年前复权单位净值-1）*100%。（1）复权单位净值体现单位净值序列及累计净值序列的波动和分红等情况。（2）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    1039: '计算展示日当天距向前追溯2年的日期之间的复权净值收益率；近2年涨跌幅=（当前复权单位净值/2年前复权单位净值-1）*100%。（1）复权单位净值体现单位净值序列及累计净值序列的波动和分红等情况。（2）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    1040: '计算展示日当天距向前追溯3年的日期之间的复权净值收益率；近3年涨跌幅=（当前复权单位净值/3年前复权单位净值-1）*100%。（1）复权单位净值体现单位净值序列及累计净值序列的波动和分红等情况。（2）<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
    month_year_Pft: '',
    month_Chg: '',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg: '',
    fiscal_year_Pft:
      '完整会计年化收益率：指在一个完整的会计年度（通常是12个月）内，本理财产品所获得的收益率。<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，请谨慎投资。</b>',
  },
  '0PWM': {
    1: '详见说明书',
    2: '',
    3: '\
        <div style="text-align: center;">基本规则</div>\
        指产品最近7日收益折算的年化收益率。<br/>\
        ①计算年化收益率时，采用产品万份收益。<br/>\
        ②Ri为产品近7日的每日的万份收益。<br/>\
        ③N为近7日累计运作天数，若成立不满7天，则为产品实际运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">七日年化收益率</div>\
        ①七日年化收益率<br/>\
        =<img src="/cn/finance/products/images/licai/formula/PWM/image004.gif"><br/>\
        ②万份收益型产品7日年化收益率=<img src="/cn/finance/products/images/licai/formula/PWM/image006.gif">*100%<br/>\
        Ri指最近第i个自然日的万份收益（i=1,2,3…7）<br/>\
        万份收益=当日理财产品已实现收益/当日理财产品总份额*10000',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '\
        <div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品成立至今的收益折算的年化收益率。<br/>\
        ①计算年化收益率时，采用产品万份收益。<br/>\
        ②Ri为产品成立日至最近自然日的每日的万份收益。<br/>\
        ③N为成立日至今的累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品从成立至今净值变化折算的年化收益率。<br/>\
        ①计算年化收益率时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品最新净值，期初净值选取产品成立日前一日净值。<br/>\
        ③运作天数为期末与期初净值日期相差的实际天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益率</div>\
        现金产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/PWM/image002.gif">*100%<br/>\
        非现金产品<br/>\
        成立以来年化收益率=（期末累计净值-期初累计净值）/期初单位净值/运作天数*365*100%。',
    a: '业绩比较基准由产品管理人依据理财产品的投资范围、投资策略、资产配置计划，并综合考虑市场环境等因素测算。业绩比较基准不是预期收益率，是本机构基于产品性质、投资策略、过往经验等因素对产品设定的投资目标，不代表产品的未来表现和实际收益，不构成对产品收益的承诺。',
    1012: '\
        <div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品成立至今的收益折算的上涨和下跌幅度。<br/>\
        ①计算涨跌幅时，采用产品万份收益。<br/>\
        ②Ri为产品成立日至最近自然日的每日的万份收益。<br/>\
        ③N为成立日至今的累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品从成立至今净值变化折算的上涨和下跌幅度。<br/>\
        ①计算涨跌幅时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品最新净值，期初净值选取产品成立日前一日净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        现金产品<br/>\
        成立以来涨跌幅={[π（1+Ri/10000）]-1}×100%<br/>\
        非现金产品<br/>\
        成立以来涨跌幅=（期末累计净值-期初累计净值）/期初单位净值',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '\
        <div style="text-align: center;">基本规则</div>\
        指定开产品当前周期净值变化折算的年化收益率。<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品最新净值，期初净值选取上个开放日的净值。<br/>\
        ③运作天数为期末与期初净值日期相差的实际天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">当前未结束周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/PWM/image008.gif">',
    1028: '\
        <div style="text-align: center;">基本规则</div>\
        指定开产品单个周期净值变化折算的年化收益率。<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②期末净值选取定开产品在周期内最后一个开放日净值，期初净值选取周期开始日的净值。<br/>\
        ③运作天数为期末与期初净值日期相差的实际天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">历史完整周期</div>\
        年化收益率=（期末累计净值-期初累计净值）/期初单位净值/运作天数*365*100%。',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品近X月收益折算的年化收益率。<br/>\
        ①计算年化收益率时，采用产品万份收益。<br/>\
        ②Ri为产品近X月每日的万份收益。<br/>\
        ③N为近X月累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品在近X月净值变化折算的年化收益率。<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②产品成立满X月开始计算。<br/>\
        ③期末净值选取产品最新净值，期初净值选取X月前净值。若期初未披露净值，则找最近的净值作为期初净值，若同时存在前后两个最近的净值，则向前找最近的净值作为期初净值。<br/>\
        ④运作天数为期末与期初净值日期相差的实际天数。<br/>\
        ⑤<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N月年化收益率</div>\
        现金产品<br/>\
        近N月年化收益率=<img src="/cn/finance/products/images/licai/formula/PWM/image002.gif">*100%<br/>\
        非现金产品<br/>\
        近N月年化收益率=（期末累计净值-期初累计净值）/期初单位净值/运作天数*365*100%',
    month_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品近X月收益的上涨和下跌幅度。<br/>\
        ①计算涨跌幅时，采用产品万份收益。<br/>\
        ②Ri为产品近X月每日的万份收益。<br/>\
        ③N为近X月累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品在近X月净值变化的上涨和下跌幅度。<br/>\
        ①计算区间涨跌幅时，采用产品累计单位净值。<br/>\
        ②产品成立满X月开始计算。<br/>\
        ③期末净值选取产品最新净值，期初净值选取X月前净值。若期初未披露净值，则找最近的净值作为期初净值，若同时存在前后两个最近的净值，则向前找最近的净值作为期初净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个月涨跌幅</div>\
        现金产品<br/>\
        近N个月涨跌幅={[π（1+Ri/10000）]-1}×100%<br/>\
        非现金产品<br/>\
        近N个月涨跌幅=（期末累计净值-期初累计净值）/期初单位净值。',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品对应年份收益的上涨和下跌幅度。<br/>\
        ①计算涨跌幅时，采用产品万份收益。<br/>\
        ②Ri为产品当年1月1日至12月31日的每日的万份收益。<br/>\
        ③N为当年1月1日至12月31日的累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品在对应年份净值变化的上涨和下跌幅度。<br/>\
        ①计算区间涨跌幅和时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品当年年末净值，期初净值选取当年年初的净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度涨跌幅</div>\
        现金产品<br/>\
        近N个会计年度涨跌幅={[π（1+Ri/10000）]-1}×100%<br/>\
        非现金产品<br/>\
        近N个会计年度涨跌幅=（期末累计净值-期初累计净值）/期初单位净值。',
    fiscal_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品对应年份收益折算的年化收益率。<br/>\
        ①计算年化收益率时，采用产品万份收益。<br/>\
        ②Ri为产品当年1月1日至12月31日的每日的万份收益。<br/>\
        ③N为当年1月1日至12月31日的累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品在对应年份净值变化折算的年化收益率。<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品当年年末净值，期初净值选取当年年初的净值。<br/>\
        ③运作天数为期末与期初净值日期相差的实际天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度收益率</div>\
        现金产品<br/>\
        近N个会计年度收益率=<img src="/cn/finance/products/images/licai/formula/PWM/image002.gif">*100%<br/>\
        非现金产品<br/>\
        近N个会计年度收益率=（期末累计净值-期初累计净值）/期初单位净值/运作天数*365*100%。',
    recent_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品最近X年收益折算的年化收益率。<br/>\
        具体规则如下：<br/>\
        ①计算年化收益率时，采用产品万份收益。<br/>\
        ②Ri为产品最近X年的每日万份收益。<br/>\
        ③N为累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品在近X年净值变化折算的年化收益率<br/>\
        具体规则如下：<br/>\
        ①产品成立满X年开始计算，计算涨跌幅时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品最新净值，期初净值选取X年前净值。若期初未披露净值，则找最近的净值作为期初净值，若同时存在前后两个最近的净值，则向前找最近的净值作为期初净值。<br/>\
        ③运作天数为期末与期初净值日期相差的实际天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近X年年化收益率</div>\
        现金产品<br/>\
        <img src="/cn/finance/products/images/licai/formula/PWM//image009.png"><br/>\
        非现金产品<br/>\
        近X年年化收益率=（期末累计净值-期初累计净值）/期初单位净值/运作天数*365*100%<br/>',
    recent_year_Chg:
      '<div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指产品最近X年的涨跌幅。<br/>\
        具体规则如下：<br/>\
        ①计算涨跌幅时，采用产品万份收益。<br/>\
        ②Ri为产品最近X年的每日万份收益。<br/>\
        ③N为累计运作天数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        非现金产品<br/>\
        指产品在近X年的净值的涨跌幅。<br/>\
        具体规则如下：<br/>\
        ①产品成立满X年开始计算，计算涨跌幅时，采用产品累计单位净值。<br/>\
        ②期末净值选取产品最新净值，期初净值选取X年前净值。若期初未披露净值，则找最近的净值作为期初净值，若同时存在前后两个最近的净值，则向前找最近的净值作为期初净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近X年年化收益率</div>\
        现金产品<br/>\
        img src="/cn/finance/products/images/licai/formula/PWM/image010.png"><br/>\
        非现金产品<br/>\
        近X年涨跌幅=（期末累计净值-期初累计净值）/期初单位净值<br/>',
  },
  '0YZX': {
    1: '详见说明书',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '',
    a: '',
    1012: '',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '货币产品：指的是产品成立（非0份额）已满七个自然日的条件下，对某个时间段（如七天、成立以来等）内每个自然日的收益率按照365天进行折算，所得出的产品年化收益率。<br/>\
        说明:以上收益率是根据理财产品在该时间段内的实际收益情况计算得出，实际清算可能因尾差等情况造成差异，投资者所能获得的最终收益以理财产品管理人实际支付为准。<br/>\
        非货产品：指的是基于某个时间段（如一个月、三个月、成立以来等）的实际涨跌幅，按照365天进行折算所得出的收益率， 计算方式为（期末累计净值-期初累计净值）÷期初单位净值÷周期天数×365×100%。<br/>\
        说明:以上收益率是根据理财产品在该时间段内的实际收益情况计算得出，赎回成本未计入，仅是一个参考指标，并非最终持有的到期收益率，投资者所能获得的最终收益以理财产品管理人实际支付为准。<br/>\
        ',
    month_Chg: '',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg: '',
    fiscal_year_Pft:
      '货币：指的是在一个完整的会计年度（通常是12个月）内，本理财产品所获得的收益率。<br/>\
        说明:以上收益率是根据理财产品在该时间段内的实际收益情况计算得出，实际清算可能因尾差等情况造成差异，投资者所能获得的最终收益以理财产品管理人实际支付为准。<br/>\
        非货：指的是在一个完整的会计年度（通常是12个月）内，本理财产品所获得的收益率。<br/>\
        说明:以上收益率是根据理财产品在该时间段内的实际收益情况计算得出，赎回成本未计入，仅是一个参考指标，并非最终持有的到期收益率，投资者所能获得的最终收益以理财产品管理人实际支付为准。',
    Chg: '指的是某个时间段内（如一个月、三个月、成立以来等）产品净值的变动情况，计算方式为（期末累计净值-期初累计净值）÷期初单位净值×100%。<br/>\
        说明:以上收益率是根据理财产品在该时间段内的实际收益情况计算得出，赎回成本未计入，仅是一个参考指标，并非最终持有的到期收益率，投资者所能获得的最终收益以理财产品管理人实际支付为准。',
    recent_year_Pft_Chg:
      '净值型产品<br/>\
        （一）区间收益率（涨跌幅） 指的是基于某个时间段内（如自今年以来/成立以来/近一个月/近三个月/近六个月/近一年/近两年/近三年/完整会计年度等）产品净值的变动情况计算的实际收益率。计算方式为（期末累计净值-期初累计净值）÷期初单位净值*100%。 <br/>\
        （二）区间年化收益率 指的是基于某个时间段内（如自今年以来/成立以来/近一个月/近三个月/近六个月/近一年/近两年/近三年/完整会计年度等）的实际区间收益率（涨跌幅），按照365天进行折算所得出的收益率。计算方式为（期末累计净值-期初累计净值）÷期初单位净值÷（期末日期-期初日期）×365×100%。<br/>\
        注：针对以上指标：①净值日期的选择，一般选取截止至当前管理人公布的最新净值（T 日）作为期末净值，期初净值取产品对应计算指标频率如初始净值/T-30日/90日/180日/365日/730日等日期公布的净值，若对应日期未公布净值，则向前取最近一次公布的净值（完整会计年度的取值规则有所不同，期末日期取最近一个会计年度的12月31日的日终净值，期初净值取上一会计年度12月31日的日终净值）。②产品成立日即运作起始日，过往业绩计算的起始日期为成立日前一日(一般为募集截止日)，该日净值为1。③今年以来/成立以来过往业绩展示区间低于1个月按照有关要求不展示，若理财产品成立后不足一个月/三个月/六个月/一年/两年/三年的，对应的区间收益率/年化收益率指标不做展示。④以上收益率是根据理财产品在该时间段内的实际收益情况计算得出，赎回成本未计入，仅是一个参考指标，并非最终持有的到期收益率，投资者所能获得的最终收益以理财产品管理人实际支付为准。⑤数据来源：信银理财。⑥过往业绩相关数据已经托管人核对。⑦<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
  },
  '0PAWM': {
    1: '详见说明书',
    2: '',
    3: '七日年化收益率=(1+R1/10000)*(1+R2/10000)*……*(1+R7/10000)^(365/7)-1)*100%，其中Rn代表第n天的每万份日收益。<br/>\
        注：①基于产品成立之日起的每万份日收益复利进行计算。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '针对非现金管理产品：<br/>\
        1. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间年化收益率=对应频次区间的涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取截止至当前管理人公布的最新净值（T日）作为期末净值，期初净值取产品对应计算指标频率T-1月/3月/6月/1年/3年对日日期公布的净值。若无对日日期公布的净值，则向前取最近一次公布的净值。③今年以来/成立以来过往业绩展示区间低于1个月按照有关要求不展示，若理财产品成立后不足3月/6月/1年/3年的，对应的涨跌幅及年化收益率指标不做展示。④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        针对现金管理产品：<br/>\
        成立以来年化收益率=(1+R1/10000)*(1+R2/10000)*……*(1+Rn/10000)^(365/n)-1)*100%，其中Rn代表第n天的每万份日收益。<br/>\
        注：①基于产品成立之日起的每万份日收益复利进行计算。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    a: '指管理人基于过往投资经验及对产品存续期投资市场波动的预判而对本产品所设定的投资目标，业绩比较基准不是预期收益率，不代表本产品的未来表现和实际收益，或投资管理人对本产品进行的收益承诺。',
    1012: '1. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间年化收益率=对应频次区间的涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取截止至当前管理人公布的最新净值（T日）作为期末净值，期初净值取产品对应计算指标频率T-1月/3月/6月/1年/3年对日日期公布的净值。若无对日日期公布的净值，则向前取最近一次公布的净值。③今年以来/成立以来过往业绩展示区间低于1个月按照有关要求不展示，若理财产品成立后不足3月/6月/1年/3年的，对应的涨跌幅及年化收益率指标不做展示。④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b> ',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '1. 涨跌幅：本投资周期涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 年化收益率：本投资周期年化收益率=本投资周期涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取本投资周期开放日净值作为期末净值，期初净值取成立日或上一开放日净值（如有），期初日期取成立日或上一开放日（如有）。③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b> <br/>\
        ',
    1028: '1. 涨跌幅：本投资周期涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 年化收益率：本投资周期年化收益率=本投资周期涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取本投资周期开放日净值作为期末净值，期初净值取成立日或上一开放日净值（如有），期初日期取成立日或上一开放日（如有）。③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b> <br/>\
       ',
    1029: '该指标为过往周期平均收益率指标，展示过往每个投资周期平均涨跌幅=∑每个投资周期涨跌幅/n，其中n代表统计的本产品所有投资周期数量。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b>',
    1030: '该指标为过往周期最好收益率指标，展示过往每个投资周期最好涨跌幅=所有投资周期中涨跌幅的最大值。<br/>\
        注：①净值类型的选择：计算涨跌幅和年化收益率时，采用理财产品复权单位净值。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    1031: '该指标为过往周期最差收益率指标，展示过往每个投资周期最差涨跌幅=所有投资周期中涨跌幅的最小值。<br/>\
        注：①净值类型的选择：计算涨跌幅和年化收益率时，采用理财产品复权单位净值。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    1032: '过往每个投资周期平均年化收益率=∑每个投资周期年化收益率/n，其中n代表统计的本产品所有投资周期数量。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    1033: '过往每个投资周期最好年化收益率=所有投资周期中年化收益率的最大值。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    1034: '过往每个投资周期最差年化收益率=所有投资周期中年化收益率的最小值。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    month_year_Pft:
      '1. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间年化收益率=对应频次区间的涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取截止至当前管理人公布的最新净值（T日）作为期末净值，期初净值取产品对应计算指标频率T-1月/3月/6月/1年/3年对日日期公布的净值。若无对日日期公布的净值，则向前取最近一次公布的净值。③今年以来/成立以来过往业绩展示区间低于1个月按照有关要求不展示，若理财产品成立后不足3月/6月/1年/3年的，对应的涨跌幅及年化收益率指标不做展示。④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b>',
    month_Chg:
      '1. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 自今年以来/成立以来/近一月/近三月/近六月/近一年/近三年区间年化收益率=对应频次区间的涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取截止至当前管理人公布的最新净值（T日）作为期末净值，期初净值取产品对应计算指标频率T-1月/3月/6月/1年/3年对日日期公布的净值。若无对日日期公布的净值，则向前取最近一次公布的净值。③今年以来/成立以来过往业绩展示区间低于1个月按照有关要求不展示，若理财产品成立后不足3月/6月/1年/3年的，对应的涨跌幅及年化收益率指标不做展示。④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '1. 涨跌幅：本会计年度涨跌幅=（期末净值-期初净值）/期初净值*100%。<br/>\
        2. 年化收益率：本会计年度年化收益率=本会计年度涨跌幅/(期末日期-期初日期)*365 *100%。<br/>\
        注：①净值类型的选择：采用理财产品复权单位净值。②净值日期的选择，选取本会计年度的12月31日日终净值作为期末净值，期初净值取本会计年度1月1日日初或上一会计年度12月31日日终净值，期初日期取本会计年度1月1日。③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    fiscal_year_Pft:
      '会计年度年化收益率=(1+R1/10000)*(1+R2/10000)*……*(1+Rn/10000)^(365/n)-1)*100%，其中Rn代表本会计年度第n天的每万份日收益。<br/>\
        注：①基于产品成立之日起的每万份日收益复利进行计算。②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        ',
    recent_year_Pft_Chg:
      '<div style="text-align: center;">基本规则</div>\
        现金产品<br/>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权 单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，期初净值取产品对应计算指标频率N周/月/年对日日期公布的净值，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品单位净值的，往前面找最近一个公布单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个公布产品单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        近N年年化收益率=<img src="/cn/finance/products/images/licai/formula/PAWM/image001.gif">',
  },
  '0Y4': {
    1: '详见说明书',
    2: '',
    3: '如产品为现金管理类，最近七日（含节假日）收益率所折算的产品年收益率，不足七日时，则采取实际日收益率折算为年化收益率的方式计算。<br/>\
        七日年化收益率（%）= <img src="/cn/finance/products/images/licai/formula/Y4/image004.gif"><br/>\
        其中，Ri为最近第i个自然日（包括计算当日）的每万份理财产品份额已实现收益。计算结果保留到小数点后4位，小数点后5位以后的部分四舍五入。<br/>\
        ',
    4: '如产品为普通净值产品<br/>\
        S日的产品近1个月年化收益率=（S日的产品累计净值-S日1个月前净值日期的产品累计净值）/S日1个月前净值日期的产品单位净值/（S日-S日1个月前净值日期）*365，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日1个月前净值日期为S日前1个月份的同一日，并依次判定：<br/>\
        1、如果前1个月份无同一日，则取前1个月份的最后一个自然日；<br/>\
        2、如果S日1个月前净值日期小于产品成立日期 ，则不计算产品近1个月涨跌幅和年化收益率；<br/>\
        3、如果S日1个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日1个月前净值日期产品无份额或产品份额为0，则不计算产品近1个月涨跌幅和年化收益率；<br/>\
        5、如果S日1个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日1个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        如产品为现金管理类产品，S日的产品近1个月年化收益率=<img src="/cn/finance/products/images/licai/formula/Y4/image002.gif"> ，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        S日1个月前净值日期为S日前1个月份的同一日，如果前1个月份无同一日，则取前1个月份的最后一个自然日。收益率起始日期为S日1个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近1个月涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    5: '如产品为普通净值产品<br/>\
        S日的产品近3个月年化收益率=（S日的产品累计净值-S日3个月前净值日期的产品累计净值）/S日3个月前净值日期的产品单位净值/（S日-S日3个月前净值日期）*365，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日3个月前净值日期为S日前3个月份的同一日，并依次判定：<br/>\
        1、如果前3个月份无同一日，则取前3个月份的最后一个自然日；<br/>\
        2、如果S日3个月前净值日期小于产品成立日期 ，则不计算产品近3个月涨跌幅和年化收益率；<br/>\
        3、如果S日3个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日3个月前净值日期产品无份额或产品份额为0，则不计算产品近3个月涨跌幅和年化收益率；<br/>\
        5、如果S日3个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日3个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        如产品为现金管理类产品，S日的产品近3个月年化收益率=<img src="/cn/finance/products/images/licai/formula/Y4/image002.gif"> ，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        S日3个月前净值日期为S日前3个月份的同一日，如果前3个月份无同一日，则取前3个月份的最后一个自然日。收益率起始日期为S日3个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近3个月涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    6: '如产品为普通净值产品<br/>\
        S日的产品近6个月年化收益率=（S日的产品累计净值-S日6个月前净值日期的产品累计净值）/S日6个月前净值日期的产品单位净值/（S日-S日6个月前净值日期）*365，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日6个月前净值日期为S日前6个月份的同一日，并依次判定：<br/>\
        1、如果前6个月份无同一日，则取前6个月份的最后一个自然日；<br/>\
        2、如果S日6个月前净值日期小于产品成立日期 ，则不计算产品近6个月涨跌幅和年化收益率；<br/>\
        3、如果S日6个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日6个月前净值日期产品无份额或产品份额为0，则不计算产品近6个月涨跌幅和年化收益率；<br/>\
        5、如果S日6个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日6个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        如产品为现金管理类产品，S日的产品近6个月年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image002.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        S日6个月前净值日期为S日前6个月份的同一日，如果前6个月份无同一日，则取前6个月份的最后一个自然日。收益率起始日期为S日6个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近6个月涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    7: '\
        非现产品<br/>\
        近1年年化收益率（%）=（报告日累计单位净值-1年前累计单位净值）/1年前单位净值/区间天数*365*100%。①区间天数为产品1年前对日日期（如不存在则取月末最后一日，如该日产品净值不发布则取上一个产品净值发布日期，不含该日）至报告日期（含该日）累计运作天数。②计算结果四舍五入保留两位小数。③赎回成本未计入，并非最终持有到期收益率。④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。相关数据经理财产品托管人复核。</b><br/>\
        现金产品<br/>\
        近1年年化收益率（%）={[(区间首日产品万份收益/10000+1)×(区间次日产品万份收益/10000+1)×……×(区间末日产品万份收益/10000+1)]^（365/区间天数）-1}*100%。①区间首日为产品前1年对日日期次日（含该日），区间天数为区间首日（含该日）至报天数至报告日期（含该日）累计运作天数。②计算结果四舍五入保留两位小数③赎回成本未计入，并非最终持有到期收益率④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。相关数据经理财产品托管人复核。</b><br/>',
    8: '',
    9: '如产品为普通净值产品且（1）普通产品、与母产品同时成立的子产品<br/>\
        S日的产品成立以来年化收益率=（S日的产品累计净值-1）/（S日-产品成立日期+1）*365，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。如果S日前一个月份的同一日（如果前一个月份无同一日，则取前一个月份的最后一个自然日）小于产品成立日期，则不计算产品成立以来涨跌幅和年化收益率。<br/>\
        收益率起始日期为产品成立日期，收益率结束日期为S日。<br/>\
        （2）母产品成立后新增的子产品<br/>\
        S日的产品成立以来年化收益率=（S日的产品累计净值-首笔份额的确认净值）/首笔份额的确认净值/（S日-首笔份额的确认日+1）*365，计算结果四舍五入保留四位小数（非百分比形式）。S日为TA系统中截至当前系统日期最新的产品净值发布日期。如果S日前一个月份的同一日（如果前一个月份无同一日，则取前一个月份的最后一个自然日）小于产品成立日期，则不计算产品成立以来涨跌幅和年化收益率。收益率起始日期为首笔份额的确认日，收益率结束日期为S日。<br/>\
        如产品为现金管理类，S日的产品成立以来年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image002.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        对于产品信息设置新增日期小于等于产品成立日期的产品，收益率起始日期为产品成立日期；对于产品信息设置新增日期大于产品成立日期的产品，收益率起始日期为首笔份额的确认日。<br/>\
        如果S日前一个月份的同一日（如果前一个月份无同一日，则取前一个月份的最后一个自然日）小于产品成立日期，则不计算产品成立以来涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。',
    a: '',
    1001: '如产品为普通净值产品且 （1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-产品初始单位净值）/产品初始单位净值/（会计年度12月31日-产品初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于普通产品、与母产品同时成立的子产品，产品初始日期为产品成立日期，产品初始单位净值为1；对于母产品成立后新增的子产品，产品初始日期为首笔份额的确认日，产品初始单位净值为首笔份额的确认净值。<br/>\
        收益率起始日期为产品初始日期，收益率结束日期为会计年度12月31日。<br/>\
            （2）非产品成立当年<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值/（会计年度12月31日-区间初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类，（1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image003.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于产品信息设置新增日期小于等于产品成立日期的产品，收益率起始日期为产品成立日期；对于产品信息设置新增日期大于产品成立日期的产品，收益率起始日期为首笔份额的确认日。<br/>\
        收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        （2）非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1002: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值/（会计年度12月31日-区间初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类，非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1003: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值/（会计年度12月31日-区间初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类，非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1004: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值/（会计年度12月31日-区间初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类，非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率=<img src="/cn/finance/products/images/licai/formula/Y4/image001.gif"> ，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1005: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值/（会计年度12月31日-区间初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类，非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1012: '如产品为普通净值产品且（1）普通产品、与母产品同时成立的子产品<br/>\
        S日的产品成立以来涨跌幅=S日的产品累计净值-1，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。如果S日前一个月份的同一日（如果前一个月份无同一日，则取前一个月份的最后一个自然日）小于产品成立日期，则不计算产品成立以来涨跌幅和年化收益率。<br/>\
        收益率起始日期为产品成立日期，收益率结束日期为S日。<br/>\
        （2）母产品成立后新增的子产品<br/>\
        S日的产品成立以来涨跌幅=（S日的产品累计净值-首笔份额的确认净值）/首笔份额的确认净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。如果S日前一个月份的同一日（如果前一个月份无同一日，则取前一个月份的最后一个自然日）小于产品成立日期，则不计算产品成立以来涨跌幅和年化收益率。<br/>\
        收益率起始日期为首笔份额的确认日，收益率结束日期为S日。<br/>\
        如产品为现金管理类，S日的产品成立以来涨跌幅=<img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        对于产品信息设置新增日期小于等于产品成立日期的产品，收益率起始日期为产品成立日期；对于产品信息设置新增日期大于产品成立日期的产品，收益率起始日期为首笔份额的确认日。<br/>\
        如果S日前一个月份的同一日（如果前一个月份无同一日，则取前一个月份的最后一个自然日）小于产品成立日期，则不计算产品成立以来涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    1013: '如产品为普通净值产品且（1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-产品初始单位净值）/产品初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于普通产品、与母产品同时成立的子产品，产品初始日期为产品成立日期，产品初始单位净值为1；对于母产品成立后新增的子产品，产品初始日期为首笔份额的确认日，产品初始单位净值为首笔份额的确认净值。<br/>\
        收益率起始日期为产品初始日期，收益率结束日期为会计年度12月31日。<br/>\
        （2）非产品成立当年<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类，（1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度涨跌幅=<img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于产品信息设置新增日期小于等于产品成立日期的产品，收益率起始日期为产品成立日期；对于产品信息设置新增日期大于产品成立日期的产品，收益率起始日期为首笔份额的确认日。<br/>\
        收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
            （2）非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。',
    1014: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类， 且非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1015: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类， 且非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率=<img src="/cn/finance/products/images/licai/formula/Y4/image001.gif"> ，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1016: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类， 且非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1017: '如产品为普通净值产品且非产品成立当年<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        如产品为现金管理类， 且非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    1018: '',
    1019: '',
    1020: '',
    1021: '如产品为普通净值产品且S日的产品近1个月涨跌幅=（S日的产品累计净值-S日1个月前净值日期的产品累计净值）/S日1个月前净值日期的产品单位净值，计算结果四舍五入保留四位小数（非百分比形式）；S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日1个月前净值日期为S日前1个月份的同一日，并依次判定：<br/>\
        1、如果前1个月份无同一日，则取前1个月份的最后一个自然日；<br/>\
        2、如果S日1个月前净值日期小于产品成立日期 ，则不计算产品近1个月涨跌幅和年化收益率；<br/>\
        3、如果S日1个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日1个月前净值日期产品无份额或产品份额为0，则不计算产品近1个月涨跌幅和年化收益率；<br/>\
        5、如果S日1个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日1个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        如产品为现金管理类，对于普通产品或子产品<br/>\
        S日的产品近1个月涨跌幅= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif"> ，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。S日1个月前净值日期为S日前1个月份的同一日，如果前1个月份无同一日，则取前1个月份的最后一个自然日。收益率起始日期为S日1个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近1个月涨跌幅和年化收益率。Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    1022: '',
    1023: '如产品为普通净值产品且S日的产品近3个月涨跌幅=（S日的产品累计净值-S日3个月前净值日期的产品累计净值）/S日3个月前净值日期的产品单位净值，计算结果四舍五入保留四位小数（非百分比形式）；S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日3个月前净值日期为S日前3个月份的同一日，并依次判定：<br/>\
        1、如果前3个月份无同一日，则取前3个月份的最后一个自然日；<br/>\
        2、如果S日3个月前净值日期小于产品成立日期 ，则不计算产品近3个月涨跌幅和年化收益率；<br/>\
        3、如果S日3个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日3个月前净值日期产品无份额或产品份额为0，则不计算产品近3个月涨跌幅和年化收益率；<br/>\
        5、如果S日3个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日3个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        如产品为现金管理类，对于普通产品或子产品<br/>\
        S日的产品近3个月涨跌幅= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。S日3个月前净值日期为S日前3个月份的同一日，如果前3个月份无同一日，则取前3个月份的最后一个自然日。收益率起始日期为S日3个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近3个月涨跌幅和年化收益率。Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    1024: '',
    1025: '',
    1026: '如产品为普通净值产品且S日的产品近6个月涨跌幅=（S日的产品累计净值-S日6个月前净值日期的产品累计净值）/S日6个月前净值日期的产品单位净值，计算结果四舍五入保留四位小数（非百分比形式）；S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日6个月前净值日期为S日前6个月份的同一日，并依次判定：<br/>\
        1、如果前6个月份无同一日，则取前6个月份的最后一个自然日；<br/>\
        2、如果S日6个月前净值日期小于产品成立日期 ，则不计算产品近6个月涨跌幅和年化收益率；<br/>\
        3、如果S日6个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日6个月前净值日期产品无份额或产品份额为0，则不计算产品近6个月涨跌幅和年化收益率；<br/>\
        5、如果S日6个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日6个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        如产品为现金管理类，对于普通产品或子产品<br/>\
        S日的产品近6个月涨跌幅= <img src="/cn/finance/products/images/licai/formula/Y4/image001.gif">，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。S日6个月前净值日期为S日前6个月份的同一日，如果前6个月份无同一日，则取前6个月份的最后一个自然日。收益率起始日期为S日6个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近6个月涨跌幅和年化收益率。Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '净值型产品:<br/>近X（X=1、3、6、12）个月涨跌幅和年化收益率<br/>\
        S日的产品近X个月年化收益率=（S日的产品累计净值-S日X个月前净值日期的产品累计净值）/S日X个月前净值日期的产品单位净值/（S日-S日X个月前净值日期）*365，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日X个月前净值日期为S日前X个月份的同一日，并依次判定：<br/>\
        1、如果前X个月份无同一日，则取前X个月份的最后一个自然日；<br/>\
        2、如果S日X个月前净值日期小于产品成立日期 ，则不计算产品近X个月涨跌幅和年化收益率；<br/>\
        3、如果S日X个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日X个月前净值日期产品无份额或产品份额为0，则不计算产品近X个月涨跌幅和年化收益率；<br/>\
        5、如果S日X个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日X个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        现金管理类产品:<br/>近X（X=1、3、6、12）个月涨跌幅和年化收益率<br/>\
        对于普通产品或子产品，TA系统需计算产品近X个月涨跌幅和年化收益率，X=1、3、6、12。<br/>\
        S日的产品近X个月涨跌幅=<img src="/cn/finance/products/images/licai/formula/Y4/image001.png"> ，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日的产品近X个月年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image002.png">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        S日X个月前净值日期为S日前X个月份的同一日，如果前X个月份无同一日，则取前X个月份的最后一个自然日。收益率起始日期为S日X个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近X个月涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    month_Chg:
      '净值型产品:<br/>近X（X=1、3、6、12）个月涨跌幅和年化收益率<br/>\
        S日的产品近X个月涨跌幅=（S日的产品累计净值-S日X个月前净值日期的产品累计净值）/S日X个月前净值日期的产品单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期。<br/>\
        S日X个月前净值日期为S日前X个月份的同一日，并依次判定：<br/>\
        1、如果前X个月份无同一日，则取前X个月份的最后一个自然日；<br/>\
        2、如果S日X个月前净值日期小于产品成立日期 ，则不计算产品近X个月涨跌幅和年化收益率；<br/>\
        3、如果S日X个月前净值日期非产品工作日，则取上一个产品工作日；<br/>\
        4、如果S日X个月前净值日期产品无份额或产品份额为0，则不计算产品近X个月涨跌幅和年化收益率；<br/>\
        5、如果S日X个月前净值日期不是产品净值发布日期，则取上一个产品净值发布日期。<br/>\
        收益率起始日期为S日X个月前净值日期的下一个自然日，收益率结束日期为S日。<br/>\
        现金管理类产品:<br/>近X（X=1、3、6、12）个月涨跌幅和年化收益率<br/>\
        对于普通产品或子产品，TA系统需计算产品近X个月涨跌幅和年化收益率，X=1、3、6、12。<br/>\
        S日的产品近X个月涨跌幅=<img src="/cn/finance/products/images/licai/formula/Y4/image001.png"> ，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        S日的产品近X个月年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image002.png">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        S日为TA系统中截至当前系统日期最新的产品净值发布日期，收益率结束日期为S日。<br/>\
        S日X个月前净值日期为S日前X个月份的同一日，如果前X个月份无同一日，则取前X个月份的最后一个自然日。收益率起始日期为S日X个月前净值日期的下一个自然日，如果收益率起始日期小于产品成立日期 ，则不计算产品近X个月涨跌幅和年化收益率。<br/>\
        Ri为计算区间每个自然日的产品每万份收益，R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        ',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '净值型产品:<br/>对于普通产品或子产品，数仓需逐年计算产品完整会计年度涨跌幅和年化收益率，并下发给TA系统。数仓需在年初第十个工作日计算产品上一年度的完整会计年度涨跌幅和年化收益率。功能投产时，数仓需计算存续产品的完整会计年度涨跌幅和年化收益率。<br/>\
        （1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-产品初始单位净值）/产品初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于普通产品、与母产品同时成立的子产品，产品初始日期为产品成立日期，产品初始单位净值为1；对于母产品成立后新增的子产品，产品初始日期为首笔份额的确认日，产品初始单位净值为首笔份额的确认净值。<br/>\
        收益率起始日期为产品初始日期，收益率结束日期为会计年度12月31日。<br/>\
        （2）非产品成立当年<br/>\
        产品完整会计年度涨跌幅=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        现金管理类产品:<br/> （1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度涨跌幅= <img src="/cn/finance/products/images/licai/formula/Y4/image001.png">，计算结果四舍五入保留四位小数（非百分比形式）；<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于产品信息设置新增日期小于等于产品成立日期的产品，收益率起始日期为产品成立日期；对于产品信息设置新增日期大于产品成立日期的产品，收益率起始日期为首笔份额的确认日。<br/>\
        收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        （2）非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率=<img src="/cn/finance/products/images/licai/formula/Y4/image001.png"> ，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
    fiscal_year_Pft:
      '净值型产品:<br/>对于普通产品或子产品，数仓需逐年计算产品完整会计年度涨跌幅和年化收益率，并下发给TA系统。数仓需在年初第十个工作日计算产品上一年度的完整会计年度涨跌幅和年化收益率。功能投产时，数仓需计算存续产品的完整会计年度涨跌幅和年化收益率。<br/>\
        （1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-产品初始单位净值）/产品初始单位净值/（会计年度12月31日-产品初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于普通产品、与母产品同时成立的子产品，产品初始日期为产品成立日期，产品初始单位净值为1；对于母产品成立后新增的子产品，产品初始日期为首笔份额的确认日，产品初始单位净值为首笔份额的确认净值。<br/>\
        收益率起始日期为产品初始日期，收益率结束日期为会计年度12月31日。<br/>\
        （2）非产品成立当年<br/>\
        产品完整会计年度年化收益率=（会计年度12月31日的产品累计净值-区间初始累计净值）/区间初始单位净值/（会计年度12月31日-区间初始日期+1）*当年实际天数，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        如果存在上一会计年度12月31日的产品单位净值且不为0，则区间初始日期为会计年度1月1日，区间初始单位净值为上一会计年度12月31日的产品单位净值，区间初始累计净值为上一会计年度12月31日的产品累计净值；如果上一会计年度12月31日的产品单位净值为0或不存在，则区间初始日期为会计年度1月1日起第二个产品单位净值不为0的净值日期，区间初始单位净值为会计年度1月1日起第一个不为0的产品单位净值，区间初始累计净值为会计年度1月1日起第一个不为0的产品累计净值 。<br/>\
        收益率起始日期为区间初始日期，收益率结束日期为会计年度12月31日。<br/>\
        现金管理类产品:<br/> （1）产品成立当年<br/>\
        对于普通产品、与母产品同时成立的子产品，产品成立当年指产品成立日期 的年份；对于母产品成立后新增的子产品，产品成立当年指首笔份额确认日的年份。<br/>\
        产品完整会计年度年化收益率= <img src="/cn/finance/products/images/licai/formula/Y4/image003.png">，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        对于产品信息设置新增日期小于等于产品成立日期的产品，收益率起始日期为产品成立日期；对于产品信息设置新增日期大于产品成立日期的产品，收益率起始日期为首笔份额的确认日。<br/>\
        收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益，n=收益率结束日期-收益率起始日期+1。<br/>\
        （2）非产品成立当年<br/>\
        产品完整会计年度涨跌幅和年化收益率=<img src="/cn/finance/products/images/licai/formula/Y4/image001.png"> ，计算结果四舍五入保留四位小数（非百分比形式）。<br/>\
        如果会计年度12月31日的产品份额为0，则不计算产品完整会计年度涨跌幅和年化收益率。<br/>\
        收益率起始日期为会计年度1月1日，收益率结束日期为会计年度12月31日。<br/>\
        Ri为计算区间每个自然日的产品每万份收益（如当日产品每万份收益不存在，则为Ri为0），R1为收益率起始日期的产品每万份收益，Rn为收益率结束日期的产品每万份收益。<br/>\
        ',
  },
  '0LNY': {
    1: '详见说明书',
    2: '',
    3: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">七日年化收益率</div>\
        ①七日年化收益率<br/>\
        =<img src="/cn/finance/products/images/licai/formula/LNY/image005.gif"><br/>\
        ②万份收益型产品7日年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image006.gif">*100%<br/>\
        <span style="font-size:12.0pt;line-height:150%;font-family:宋体;color:windowtext" lang="EN-US">R<sub>i</sub></span>指最近第i个自然日的万份收益（i=1,2,3…7）<br/>\
        万份收益=当日理财产品已实现收益/当日理财产品总份额*10000',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益率</div>\
        ①非万份收益型产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image001.gif"><br/>\
        ②万份收益型产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image003.gif">*100%<br/>\
        Ri指成立以来至最近一个自然日区间每个自然日的万份收益。R1指成立日当日的万份收益，RN指最近一个自然日的万份收益。N=最近一个自然日-成立日期+1。',
    a: '指理财产品管理人基于过往投资经验及对产品存续期投资市场波动的预判所设定的投资目标，业绩比较基准不是预期收益率，不代表产品未来的表现和实际收益，不构成对产品收益的承诺。具体以产品说明书为准。',
    1012: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/LNY/image009.gif">',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">当前未结束周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image014.gif">',
    1028: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">历史完整周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image015.gif">',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N月年化收益率</div>\
        近N月年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image008.gif">',
    month_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个月涨跌幅</div>\
        近N月区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/LNY/image013.gif">',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度涨跌幅</div>\
        完整会计年度区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/LNY/image011.gif">',
    fiscal_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度收益率</div>\
        完整会计年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image004.gif">',
    recent_year_Pft_Chg:
      '<div style="text-align: center;">基本规则</div>\
        基本规则<br/>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        近N年年化收益率=<img src="/cn/finance/products/images/licai/formula/LNY/image016.gif"><br/>\
        ',
  },
  '0Y3': {
    1: '详见说明书',
    2: '',
    3: '现金管理类产品七日年化=<img src="/cn/finance/products/images/licai/formula/Y03/image007.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/Y03/image008.gif">为最近第i个自然日(包括计算当日)的万份收益；<br/>\
        万份收益是按照相关法规计算的每万份产品份额的单日已实现收益<br/>\
        ',
    7: '',
    8: '',
    9: '<div style="text-align: center;">基本规则</div>\
        ①计算近N月/年过往业绩时，对日指与最新的净值日期对日。例如，近1月，指2023年11月27日-2023年10月27日。<br/>\
        ②计算近N月/年过往业绩时，若N月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益</div>\
        ①非现产品<br/>\
        成立以来年化收益=<img src="/cn/finance/products/images/licai/formula/Y03/image001.gif"><br/>\
        ②现金管理类产品<br/>\
        成立以来年化收益=<img src="/cn/finance/products/images/licai/formula/Y03/image002.gif">*100%<br/>\
        <img src="/cn/finance/products/images/licai/formula/Y03/image003.gif">指成立以来至最近一个自然日区间每个自然日的万份收益。N=最近一个自然日-成立日期+1。<br/>\
        ',
    a: '',
    1012: '<div style="text-align: center;">基本规则</div>\
        ①计算近N月/年过往业绩时，对日指与最新的净值日期对日。例如，近1月，指2023年11月27日-2023年10月27日。<br/>\
        ②计算近N月/年过往业绩时，若N月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来非年化收益</div>\
        ①非现成立以来非年化收益<br/>\
        =<img src="/cn/finance/products/images/licai/formula/Y03/image010.gif"><br/>\
        ②现金管理非年化收益<br/>\
        =<img src="/cn/finance/products/images/licai/formula/Y03/image011.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/Y03/image012.gif">指成立以来至最近一个自然日区间每个自然日的万份收益<br/>\
        ',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        ①计算近N月/年过往业绩时，对日指与最新的净值日期对日。例如，近1月，指2023年11月27日-2023年10月27日。<br/>\
        ②计算近N月/年过往业绩时，若N月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N月年化收益率</div>\
        非现产品近N月年化收益率<br/>\
        =<img src="/cn/finance/products/images/licai/formula/Y03/image009.gif"><br/>\
        ',
    month_Chg:
      '<div style="text-align: center;">基本规则</div>\
        ①计算近N月/年过往业绩时，对日指与最新的净值日期对日。例如，近1月，指2023年11月27日-2023年10月27日。<br/>\
        ②计算近N月/年过往业绩时，若N月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个月非年化收益</div>\
        非现产品近N月非年化收益=<img src="/cn/finance/products/images/licai/formula/Y03/image015.gif"><br/>\
        ',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '<div style="text-align: center;">基本规则</div>\
        ①计算近N月/年过往业绩时，对日指与最新的净值日期对日。例如，近1月，指2023年11月27日-2023年10月27日。<br/>\
        ②计算近N月/年过往业绩时，若N月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度非年化收益</div>\
        非现完整会计年度非年化收益= <img src="/cn/finance/products/images/licai/formula/Y03/image013.gif"><br/>\
        现金管理类完整会计年度非年化收益<img src="/cn/finance/products/images/licai/formula/Y03/image014.gif"><br/>\
        i=1,2,3,4,....N<br/>\
        <img src="/cn/finance/products/images/licai/formula/Y03/image012.gif">为XX年1月1日-XX年12月31日每个自然日的万份收益<br/>\
        ',
    fiscal_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        ①计算近N月/年过往业绩时，对日指与最新的净值日期对日。例如，近1月，指2023年11月27日-2023年10月27日。<br/>\
        ②计算近N月/年过往业绩时，若N月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度年化收益</div>\
        非现完整会计年度年化收益=<img src="/cn/finance/products/images/licai/formula/Y03/image004.gif"><br/>\
        现金管理类完整会计年度年化收益<img src="/cn/finance/products/images/licai/formula/Y03/image005.gif"><br/>\
        i=1,2,3,4,....N<br/>\
        <img src="/cn/finance/products/images/licai/formula/Y03/image003.gif">为XX年1月1日-XX年12月31日每个自然日的万份收益<br/>\
        ',
    recent_year_Pft_Chg:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品累计单位净值。<br/>\
        ②计算近N周 /月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        近N年年化收益率=<img src="/cn/finance/products/images/licai/formula/Y03/image016.gif"><br/>',
  },
  '066': {
    1: '详见说明书',
    2: '',
    3: '指产品最近七日（含节假日）收益率按照复利方式所折算的产品年化收益率。产品成立不满七日时以实际日收益率折算年收益率。<br/>\
        ①产品存续期内新增某产品份额类型的，为展示目的，该份额类型七日年化收益率从首个有投资者申购份额确认成功的日期（含该日）起算。<br/>\
        ②收益率四舍五入保留至百分号内小数点后2位。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <img src="/cn/finance/products/images/licai/formula/66/image003.png"><br/>\
        其中，Ri为最近第i个自然日(包括计算当日)的每万份理财计划已实现收益。<br/>\
        ',
    4: '',
    5: '',
    6: '',
    7: '指最新净值日期（即统计期末）和对应时间（即统计期初）内的区间年化收益率，赎回费（如有）未计入。区间年化收益率(%)=（期末份额累计净值-期初份额累计净值）/期初单位净值/区间天数*365*100%。<br/>\
        ①近1月/近3月/近6月/近1年年化收益率的统计期初指最新净值日期的1月前/3月前/6月前/1年前日期，如当日为非估值日、产品无净值数据，则顺延至前一个有净值数据的日期。<br/>\
        ②区间天数为产品从统计期初（不含）至统计期末（含）的累计运作天数。<br/>\
        ③收益率四舍五入后保留两位小数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        ',
    8: '',
    9: '对于非现金管理类产品，指从产品成立日（含）到最新净值日期（含）之间的区间年化收益率，赎回费（如有）未计入。<br/>\
        ①产品存续期内新增某产品份额类型的，为展示目的，该份额类型成立以来年化收益率的计算起始时间为首个有投资者申购份额确认成功的日期。<br/>\
        ②收益率四舍五入后保留两位小数。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        对于现金管理类产品，指产品成立以来的每日（含节假日）收益率按照复利方式所折算的产品年化收益率。<br/>\
        ①产品存续期内新增某产品份额类型的，为展示目的，该份额类型成立以来年化收益率的计算起始时间为首个有投资者申购份额确认成功的日期。<br/>\
        ②收益率四舍五入保留至百分号内小数点后2位。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <img src="/cn/finance/products/images/licai/formula/66/image001.gif"><br/>\
        其中 ，产品成立日或某产品份额类型首个有投资者份额确认成功的日期记为第1日，指标计算日当日记为第n日。Ri为第i个自然日的每万份理财计划已实现收益。<br/>\
        ',
    a: '',
    1012: '指从产品成立日（含）到最新净值日期（含）之间的区间净值涨跌幅，赎回费（如有）未计入。<br/>\
        ①产品存续期内新增某产品份额类型的，为展示目的，该份额类型成立以来净值涨跌幅的计算起始时间为首个有投资者申购份额确认成功的日期。<br/>\
        ②收益率四舍五入后保留两位小数。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        ',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '指从产品封闭期首日（含）到下一个开放期末日（含）之间的区间年化收益率。<br/>\
        ①对于定期开放式产品的首个周期，封闭期首日指产品成立日；对于定期开放式产品的非首个周期，封闭期首日指上个开放期末日的下一自然日。<br/>\
        ②如当前正处于封闭期内，则当前周期区间指从封闭期首日（含）到最新净值日期（含）。<br/>\
        ③收益率四舍五入后保留两位小数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        ',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    1038: '指最新净值日期（即统计期末）和对应时间（即统计期初）内的区间净值涨跌幅，赎回费（如有）未计入。区间净值涨跌幅(%)=（期末份额累计净值-期初份额累计净值）/期初单位净值*100%。<br/>\
        ①近1月/近3月/近6月/近1年净值涨跌幅的统计期初指最新净值日期的1月前/3月前/6月前/1年前日期，如当日为非估值日、产品无净值数据，则顺延至前一个有净值数据的日期。<br/>\
        ②收益率四舍五入后保留两位小数。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        ',
    month_year_Pft:
      '指最新净值日期（即统计期末）和对应时间（即统计期初）内的区间年化收益率，赎回费（如有）未计入。区间年化收益率(%)=（期末份额累计净值-期初份额累计净值）/期初单位净值/区间天数*365*100%。<br/>\
        ①近1月年化/近3月年化/近6月年化/近1年年化的统计期初指最新净值日期的1月前/3月前/6月前/1年前日期，如当日为非估值日、产品无净值数据，则顺延至前一个有净值数据的日期。<br/>\
        ②区间天数为产品从统计期初（不含）至统计期末（含）的累计运作天数。<br/>\
        ③收益率四舍五入后保留两位小数。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        ',
    month_Chg:
      '指最新净值日期（即统计期末）和对应时间（即统计期初）内的区间净值涨跌幅，赎回费（如有）未计入。区间净值涨跌幅(%)=（期末份额累计净值-期初份额累计净值）/期初单位净值*100%。<br/>\
        ①近1月年化/近3月年化/近6月年化净值涨跌幅的统计期初指最新净值日期的1月前/3月前/6月前日期，如当日为非估值日、产品无净值数据，则顺延至前一个有净值数据的日期。<br/>\
        ②收益率四舍五入后保留两位小数。<br/>\
        ③<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        ',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg: '',
    fiscal_year_Pft:
      '对于非现金管理类产品，指从某年度1月1日（含）到当年12月31日（含）之间的区间净值涨跌幅。<br/>\
        ①收益率四舍五入后保留两位小数。<br/>\
        ②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        对于现金管理类产品，指从某年度1月1日（含）到当年12月31日（含）之间每日（含节假日）收益率按照复利方式所折算的收益率。<br/>\
        ①收益率四舍五入保留至百分号内小数点后2位。<br/>\
        ②<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <img src="/cn/finance/products/images/licai/formula/66/image002.gif"><br/>\
        其中，1月1日记为第1日，12月31日记为第n日。Ri为第i个自然日的每万份理财计划已实现收益。<br/>\
    ',
  },
  '0MS': {
    1: '详见说明书',
    2: '',
    3: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值，往前面找最近一个有产品复权单位净值日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">七日年化收益率</div>\
        ①非万份收益型产品七日年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image001.gif">100%<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为估值日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为上周同日单位净值，若无目标日净值，则往前取更早日期净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额<br/>\
        ②万份收益型产品七日年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image013.gif">*100%<br/>\
        <span style="font-size:12.0pt;line-height:150%;font-family:宋体;color:windowtext" lang="EN-US">R<sub>i</sub></span>指最近第i个自然日的万份收益（i=1,2,3…7）<br/>\
        万份收益=当日理财产品已实现收益/当日理财产品总份额*10000',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值的，往前面找最近一个有产品复权单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">成立以来年化收益率</div>\
        ①非万份收益净值型产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image006.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image007.gif">为计算截止日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image008.gif">为计算开始日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image009.gif">为计算期间第i次产品分红除权日前一交易日(交易所日历)单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image010.gif">为计算期间第i次产品分红单位分红金额<br/>\
        ②万份收益型产品<br/>\
        成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image011.gif">*100%<br/>\
        <span style="font-size:12.0pt;line-height:150%;font-family:宋体;color:windowtext" lang="EN-US">R<sub>i</sub></span>指成立以来至最近一个自然日区间每个自然日的万份收益。<span style="font-size:12.0pt;line-height:150%;font-family:宋体;color:windowtext" lang="EN-US">R<sub>1</sub></span>指成立日当日的万份收益，<span style="font-size:12.0pt;line-height:150%;font-family:宋体;color:windowtext" lang="EN-US">R<sub>N</sub></span>指最近一个自然日的万份收益。N=最近一个自然日-成立日期+1。',
    a: '指理财产品管理人基于过往投资经验及对产品存续期投资市场波动的预判所设定的投资目标，业绩比较基准不是预期收益率，不代表产品未来的表现和实际收益，不构成对产品收益的承诺。具体以产品说明书为准。',
    1001: '',
    1002: '',
    1003: '',
    1004: '',
    1005: '',
    1006: '',
    1007: '',
    1008: '',
    1009: '',
    1010: '',
    1011: '',
    1012: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值，往前面找最近一个有产品复权单位净值日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        成立以来涨跌幅=<img src="/cn/finance/products/images/licai/formula/MS/image001.gif">100%<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为估值日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为成立时初始单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值，往前面找最近一个有产品复权单位净值日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">历史完整周期</div>\
        年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image015.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为周期结束开放日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为周期起始开放日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值，往前面找最近一个有产品复权单位净值日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个月年化收益率</div>\
        近N个月年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image014.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image007.gif">为计算截止日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image008.gif">为计算开始日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image009.gif">为计算期间第i次产品分红除权日前一交易日(交易所日历)单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image010.gif">为计算期间第i次产品分红单位分红金额',
    month_Chg:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值，往前面找最近一个有产品复权单位净值日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个月涨跌幅</div>\
        近N月涨跌幅=<img src="/cn/finance/products/images/licai/formula/MS/image001.gif">100%<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为计算截止日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为计算开始日单位净值。若无目标日净值，则往前取更早日期净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值的，往前面找最近一个有产品复权单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度涨跌幅</div>\
        近N个会计年度涨跌幅=<img src="/cn/finance/products/images/licai/formula/MS/image001.png">100%<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为前N个会计年度12月31日估值日单位净值。若无目标日净值，则往前取更早日期净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为前N个会计年度1月1日单位净值。若无目标日净值，则往前取更早日期净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额',
    fiscal_year_Pft:
      '\
        <div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值，往前面找最近一个有产品复权单位净值日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度收益率</div>\
        近N个会计年度年化收益率=<img src="/cn/finance/products/images/licai/formula/MS/image012.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为成立日所在年度年末单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为成立时初始单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额<br/>\
        ',
    recent_year_Pft_Chg:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，采用产品复权单位净值。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品复权单位净值的，往前面找最近一个有产品复权单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品复权单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品复权单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。</b><br/>\
        近N年年化收益率= <img src="/cn/finance/products/images/licai/formula/MS/image016.gif"><br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image002.gif">为成立日所在年度年末单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image003.gif">为成立时初始单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image004.gif">为计算期间第i次产品分红除权日前一交易日单位净值<br/>\
        <img src="/cn/finance/products/images/licai/formula/MS/image005.gif">为计算期间第i次产品分红单位分红金额<br/>\
        ',
  },
  '0BK': {
    1: '详见说明书',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '<div style="text-align: center;">基本规则</div>\
            指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
            ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
            ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
            ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
            ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
            <div style="text-align: center;"> 成立以来年化收益率</div>\
            ①初始净值为1<br/>\
            成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/BK/image001.png"><br/>\
            ②初始净值不为1（适用于产品成立一段时间后新发的子份额）<br/>\
            成立以来年化收益率=<img src="/cn/finance/products/images/licai/formula/BK/image002.png"><br/>\
            t2为子份额上线日期。',
    a: '指理财产品管理人综合考虑市场环境、产品性质、投资策略、过往表现等因素对理财产品设置的投资目标。业绩比较基准不是预期收益率，不代表产品未来的表现和实际收益，不构成对产品收益的承诺。具体以产品说明书为准。',
    1012: '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间涨跌幅，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来涨跌幅</div>\
        ①初始净值为1<br/>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/BK/image007.png"><br/>\
        ②初始净值不为1（适用于产品成立一段时间后新发的子份额）<br/>\
        成立以来区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/BK/image008.png"><br/>\
        t2为子份额上线日期。<br/>\
        ',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">当前未结束周期年化收益率</div>\
        当前未结束周期年化收益率=<img src="/cn/finance/products/images/licai/formula/BK/image012.png"><br/>\
        ',
    1028: '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">历史完整周期年化收益率</div>\
        历史第N个完整周期年化收益率=<img src="/cn/finance/products/images/licai/formula/BK/image013.png"><br/>\
        ',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N月/年年化收益率</div>\
        近N月/年年化收益率=<img src="/cn/finance/products/images/licai/formula/BK/image005.png"><br/>\
        ',
    month_Chg:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间涨跌幅，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N月/年涨跌幅</div>\
        近N月/年区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/BK/image011.png"><br/>\
        ',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间涨跌幅，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">成立以来近第N个会计年度涨跌幅</div>\
        成立以来近第N个会计年度区间涨跌幅=<img src="/cn/finance/products/images/licai/formula/BK/image009.png"><br/>\
        ',
    fiscal_year_Pft:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
        ①计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        <div style="text-align: center;">近N个会计年度收益率</div>\
        完整会计年度收益率=<img src="/cn/finance/products/images/licai/formula/BK/image006.png"><br/>\
        ',
    recent_year_Pft_Chg:
      '<div style="text-align: center;">基本规则</div>\
        指该产品最新净值日期和对应时间内的区间年化收益率，赎回成本未计入。并非最终持有到期的收益率。具体规则如下：<br/>\
            计算区间涨跌幅和年化收益率时，考虑区间内产品分红。<br/>\
        ②计算近N周/月/年过往业绩时，对日指与最新的净值日期对日。例如，近1年，指2022年12月21日-2023年12月21日。<br/>\
        ③计算近N周/月/年过往业绩时，若N周/月/年前对日当日无产品累计单位净值的，往前面找最近一个有产品累计单位净值的日期。例如，最新的净值日期为2023年12月18日，计算近1个月年化收益率时，按照对日规则，计算区间为2023年11月18日-2023年12月18日，2023年11月18日为周六，若当日无产品净值，而最近一个有产品累计单位净值的日期为2023年11月17日，则计算区间改为2023年11月17日-2023年12月18日，采用的净值为2023年11月17日、2023年12月18日的产品累计单位净值。<br/>\
        ④<b>理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资须谨慎。</b><br/>\
        近N年涨跌幅=<img src="/cn/finance/products/images/licai/formula/BK/image014.gif"><br/>\
        近N年年化收益率=<img src="/cn/finance/products/images/licai/formula/BK/image015.gif"><br/>',
  },
  '001': {
    1: '详见说明书',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
    7: '',
    8: '',
    9: '',
    a: '',
    1012: '',
    1013: '',
    1014: '',
    1015: '',
    1016: '',
    1017: '',
    1018: '',
    1019: '',
    1020: '',
    1021: '',
    1022: '',
    1023: '',
    1024: '',
    1025: '',
    1026: '',
    1027: '',
    1028: '',
    1029: '',
    1030: '',
    1031: '',
    1032: '',
    1033: '',
    1034: '',
    month_year_Pft: '',
    month_Chg: '',
    week_year_Pft: '',
    week_Chg: '',
    fiscal_year_Chg: '',
    fiscal_year_Pft: '',
  },
};

var ToolMethod = {
  methods: {
    autoEllipsis: function (val, w, s) {
      return toolkit.autoEllipsis(val, w, s, 1, 'span');
    },
    round: function (val) {
      return ProductTool.rateRound(val);
    },
    format: function (val) {
      return val == 0 ? '-' : val;
    },
    Rsk_Grd_Cd_MAP: function (val) {
      return ProductDataMap.Rsk_Grd_Cd[val];
    },
    Pft_Pcsg_Mod_MAP: function (val) {
      return ProductDataMap.Pft_Pcsg_Mod[val];
    },
    Pft_Pcsg_Mod_Tips_MAP: function (val) {
      return ProductDataMap.Pft_Pcsg_Mod_Tips[val];
    },
    Pft_Pcsg_Mod_Tips_MAP_NEW: function (val, code) {
      // console.log(val,code)

      // var codeMaps = ['0JH','0EW']
      // if(codeMaps.includes(code)) code = '0JH_0EW'
      var tipsCode = 0;
      var isKeyVal = false;
      var keys = [];
      if (ProductDataMap.Pft_Pcsg_Mod_Tips_Code[code]) {
        keys = Object.keys(ProductDataMap.Pft_Pcsg_Mod_Tips_Code[code]);
      }
      keys.forEach(function (key) {
        // console.log(ProductDataMap.Pft_Pcsg_Mod_Tips_Code[code][key])
        if (
          ProductDataMap.Pft_Pcsg_Mod_Tips_Code[code][key].some(
            function (item) {
              return item == val;
            },
          )
        ) {
          tipsCode = key;
          isKeyVal = true;
        }
      });
      // console.log(val)
      if (!isKeyVal) tipsCode = val;
      // console.log(ProductDataMap[code][tipsCode])
      if (ProductDataMap[code] && ProductDataMap[code][tipsCode])
        return ProductDataMap[code][tipsCode];
      return;
    },
  },
};

var ProductsMixin = {
  mixins: [ToolMethod],
  methods: {
    isStandard: function () {
      return this.product.Pft_Pcsg_Mod === 'a';
    },
    Ivs_Trm: function () {
      var product = this.product;

      return ProductTool.investTerm(product);
    },
    purchaseAmount: function () {
      return ProductTool.purchaseAmount(this.product);
    },
    currencyUnit: function () {
      return ProductTool.currencyUnit(this.product);
    },
    saledRatio: function () {
      var product = this.product,
        SplLmt = product.SplLmt;

      if (SplLmt == '99999999999999999.99') return null;

      return Math.max(
        0,
        ((1 - product.SplLmt / product.BnNm_Sz_UpLm_Val) * 100 + 0.5) | 0,
      );
    },
  },
};

var ProductMixin = {
  mixins: [ToolMethod],
  computed: {
    isStandard: function () {
      return this.product.Pft_Pcsg_Mod === 'a';
    },
    Ivs_Trm: function () {
      return ProductTool.investTerm(this.product);
    },
    purchaseAmount: function () {
      return ProductTool.purchaseAmount(this.product);
    },
    currencyUnit: function () {
      return ProductTool.currencyUnit(this.product);
    },
    saledRatio: function () {
      var product = this.product,
        SplLmt = product.SplLmt;

      if (SplLmt == '99999999999999999.99') return null;

      return Math.max(
        0,
        ((1 - product.SplLmt / product.BnNm_Sz_UpLm_Val) * 100 + 0.5) | 0,
      );
    },
  },
};

function request(param) {
  var prev = request.prev || Promise.resolve();

  var cur = prev.then(function () {
    return toolkit.ajax(param);
  });

  request.prev = cur.catch(Function.prototype);
  request.prev.param = param;

  return cur;
}

!(function () {
  var scrollTop;
  window.lockWindow = function () {
    scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    $('body').addClass('lock-window').css('top', -scrollTop);
  };
  window.unlockWindow = function () {
    ($('body').removeClass('lock-window').css('top', ''),
      window.scrollTo(0, scrollTop));
  };
})();
