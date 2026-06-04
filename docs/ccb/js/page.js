!(function () {
  var baseURL =
    '/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5';

  /**
   * 通用组件
   */
  registerComponent(
    'Loading',
    function () {
      return {
        template:
          '<div :show="show"><img class="loading_icon" src="/cn/creditcard/v3/images/load.gif"></div>',
        data: function () {
          return {
            show: true,
          };
        },
        props: {
          delay: Number,
        },
        beforeMount: function () {
          if (this.delay) {
            this.$setData('show', false);

            var _self = this;
            setTimeout(function () {
              _self.$setData('show', true);
            }, this.delay);
          }
        },
      };
    },
    {
      style: {
        '.loading_icon': {
          margin: 'auto',
          padding: '10px 0',
          display: 'block',
        },
      },
    },
  );

  registerComponent('RiskWarning', function () {
    return {
      template:
        '<div class="licai_tips" style="text-align:left;">\
                    <span><em></em>理财非存款，产品有风险，投资须谨慎。本产品由建信理财有限责任公司发行和管理，中国建设银行不承担产品的投资、兑付和风险。请认真阅读<a target="_blank" :if="product.Web_Acs_Rsc_URL" href="{{product.Web_Acs_Rsc_URL}}">《风险揭示与产品说明书》</a><a :else>《风险揭示与产品说明书》</a>等文件，了解产品发行机构、产品属性、主要风险和风险评级情况等信息。</span>\
                </div>',
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
    };
  });

  registerComponent('DepositRiskWarning', function () {
    return {
      template:
        '<div class="licai_tips">\
                    <span><em></em>结构性存款不同于一般性存款，具有投资风险，不可提前支取，您应当充分认识投资风险，谨慎投资。</span>\
                </div>',
    };
  });

  /**
   * 列表组件
   */
  registerComponent('SearchSection', function () {
    return {
      template:
        '<div :if="showSearch" class="licai_search_btn">\
                    <span class="fl">产品搜索：</span>\
                    <div class="licai_input fl">\
                        <input type="text" :ref="input" placeholder="产品名称/简拼/关键字">\
                        <img @click="search" src="/cn/finance/products/images/licai/licai_search.png">\
                    </div>\
                    <div class="fl">\
                        <span>历史搜索：</span>\
                        <span>乾元</span>\
                        <span>日鑫</span>\
                        <span>臻尚</span>\
                        <span>开放型</span>\
                    </div>\
                </div>\
                <div class="licai_screen">\
                    <div class="licai_tit_li">\
                        <div :for="(option, index) in validOptions" key={{option.key}} class="licai_li {{ {hide:isFold && index>=minShow} }}">\
                            <span class="fl">{{option.name}}</span>\
                            <ul>\
                                <li :for="(choosen, cIndex) in option.choosens" key={{choosen.id}} class={{ {hide:!option.showMore && cIndex>=8} }} @click="select">\
                                    <a class={{ {active:isActive()} }} href="javascript:;">{{choosen.name}}</a>\
                                </li>\
                            </ul>\
                            <p :if="option.choosens.length>8" @click="toggleChoosen" class="li_more {{ {li_more_up:option.showMore} }}">更多</p>\
                        </div>\
                        <div :if="options.length>minShow" class="licai_open {{ {licai_close:!isFold} }}" @click="toggleFold">{{isFold?"展开":"收起"}}</div>\
                    </div>\
                    <div class="screen_li">\
                        <span>筛选条件：</span>\
                        <ul>\
                            <li :for="option in selectedOptions" key={{option.key}} >{{option.selectChoosen.name}}<em @click="select">x</em></li>\
                        </ul>\
                        <a href="javascript:;" @click="select">清除</a>\
                    </div>\
                    <p>为您显示在<strong :if="selectCity">{{selectCity}}</strong>销售的{{setConductName}}。共找到 <span class="red">{{totalRec}}</span> 只符合筛选条件的{{setConductName}}。</p>\
                </div>',
      data: function () {
        return {
          showSearch: false,
          minShow: 3,
          isFold: null,
          options: genOptions(),
        };
      },
      props: {
        totalRec: {
          type: Number,
          default: 0,
        },
      },
      emits: ['select', 'search'],
      computed: {
        validOptions: function () {
          return this.options.filter(function (option) {
            return option.choosens && option.choosens.length;
          });
        },
        selectedOptions: function () {
          return this.options.filter(function (option) {
            return option.selectChoosen;
          });
        },
        selectCity: function () {
          var selected = this.options['发行区域'].selectChoosen;

          return selected && selected.name;
        },
        setConductName: function () {
          return /deposit/gm.test(location.href)
            ? '结构性存款产品'
            : '理财产品';
        },
      },
      methods: {
        isActive: function () {
          if (this.choosen && this.option) {
            var option = this.option;

            return (
              this.choosen.id ===
              (option.selectChoosen
                ? option.selectChoosen.id
                : option.defaultChoosen
                  ? option.defaultChoosen.id
                  : '')
            );
          }
        },
        toggleFold: function () {
          this.$setData('isFold', !this.isFold);
        },
        toggleChoosen: function () {
          this.$setData('option.showMore', !this.option.showMore);
        },
        search: function () {
          this.$emit('search', this.$refs.input.value);
        },
        select: function () {
          if (this.option) {
            this.$setData(
              'option.selectChoosen',
              this.choosen || this.option.defaultChoosen || null,
            );
          } else {
            this.options.forEach(function (option) {
              option.selectChoosen = option.defaultChoosen || null;
            });
            this.$setData.force('options', this.options);
          }

          this.notify();
        },
        notify: function () {
          var selectMap = this.options.reduce(function (selectMap, option) {
            if (option.key && option.selectChoosen) {
              selectMap[option.key] = option.selectChoosen;
            }

            return selectMap;
          }, {});

          this.$emit('select', selectMap);
        },
      },
      beforeMount: function () {
        var component = this;

        getProvinces().then(function (provinces) {
          var branchProvinceName = toolkit.getCookie('bankName'),
            defaultProvince = null;

          if (branchProvinceName) {
            defaultProvince = provinces.find(function (province) {
              return ~province.name.indexOf(branchProvinceName.substr(0, 2));
            });
          } else {
            defaultProvince = provinces.find(function (province) {
              return ~province.name.indexOf('北京');
            });

            locateProvince().then(function (provinceName) {
              defaultProvince = provinces.find(function (province) {
                return ~province.name.indexOf(provinceName.substr(0, 2));
              });

              component.$setData({
                "options['发行区域'].selectChoosen": defaultProvince,
                "options['发行区域'].defaultChoosen": defaultProvince,
              });

              component.notify();
            });
          }

          component.$setData({
            "options['发行区域'].choosens": provinces,
            "options['发行区域'].selectChoosen": defaultProvince,
            "options['发行区域'].defaultChoosen": defaultProvince,
          });

          component.notify();
        });

        this.$setData({ isFold: this.options.length > this.minShow });
      },
      mounted: function () {
        this.notify();
      },
    };

    function locateProvince() {
      return toolkit
        .ajax({
          url: '/query2BankCityByIP.gsp?queryType=2',
          dataType: 'json',
        })
        .then(function (res) {
          return res.provName;
        });
    }

    function getProvinces() {
      return toolkit
        .ajax({
          url: '/cn/finance/v3/js/citys.js',
          dataType: 'script',
        })
        .then(function () {
          var provinces = citsy.map(function (item) {
            var name = item.name;

            if (name === '广西省') name = '广西区';

            return { name: name, id: item.code + '000000' };
          });

          return provinces;
        });
    }

    function genOptions() {
      var options = [
        {
          name: '发行区域',
          key: 'Txn_BO_ID',
          choosens: null,
          selectChoosen: null,
          defaultChoosen: null,
          showMore: false,
        },
        // {
        //     "name": "发行机构",
        //     "key": "Multi_Issu_Inst_Ind",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "建行", "id": "1" },
        //         { "name": "代销", "id": "2" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // },
        // {
        //     "name": "产品类型",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "龙祥", "id": "1" },
        //         { "name": "开芯纳财", "id": "2" },
        //         { "name": "安鑫", "id": "3" },
        //         { "name": "净鑫净利", "id": "4" },
        //         { "name": "龙宝", "id": "5" },
        //         { "name": "龙悦", "id": "6" },
        //         { "name": "龙跃", "id": "7" },
        //         { "name": "恒盈", "id": "8" },
        //         { "name": "日日鑫高", "id": "9" },
        //         { "name": "日鑫月溢", "id": "10" },
        //         { "name": "满溢", "id": "11" },
        //         { "name": "建信宝", "id": "12" },
        //         { "name": "睿鑫", "id": "13" },
        //         { "name": "嘉鑫", "id": "14" },
        //         { "name": "福鑫", "id": "15" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // },
        // {
        //     "name": "投资期限",
        //     "key": "Pln_Clc_TpCd",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "开放型", "id": "1" },
        //         { "name": "30天以内", "id": "2" },
        //         { "name": "30-60天", "id": "3" },
        //         { "name": "60-120天", "id": "4" },
        //         { "name": "120-180天", "id": "5" },
        //         { "name": "180-240天", "id": "6" },
        //         { "name": "240-360天", "id": "7" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // },
        // {
        //     "name": "风险等级",
        //     "key": "Rsk_Grd_Cd",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "无风险", "id": "1" },
        //         { "name": "低风险", "id": "2" },
        //         { "name": "中等风险", "id": "3" },
        //         { "name": "中高风险", "id": "4" },
        //         { "name": "高风险", "id": "5" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // },
        // {
        //     "name": "收益率",
        //     "key": "Exg_Pft_Cmnt",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "3%以下", "id": "1" },
        //         { "name": "3-4%", "id": "2" },
        //         { "name": "4-5%", "id": "3" },
        //         { "name": "5-6%", "id": "4" },
        //         { "name": "6-7%", "id": "5" },
        //         { "name": "7%以上", "id": "6" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // },
        // {
        //     "name": "起购金额",
        //     "key": "MkDAm_Rng",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "5万及以上", "id": "3" },
        //         { "name": "10万及以上", "id": "4" },
        //         { "name": "20万及以上", "id": "5" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // },
        // {
        //     "name": "币种",
        //     "key": "CcyCd",
        //     "choosens": [
        //         { "name": "全部", "id": "" },
        //         { "name": "人民币", "id": "1" },
        //         { "name": "外币", "id": "2" }
        //     ],
        //     "selectChoosen": null,
        //     "showMore": false
        // }
      ];

      options.forEach(function (option) {
        options[option.name] = option;
      });

      return options;
    }
  });

  registerComponent('Tabs', function () {
    return {
      template:
        '<div class="pro_tit">\
                    <ul>\
                        <li :for="tab in tabs" :bind="$attrs" @click="select" key={{tab.id}} class={{ {active:active === tab} }}>{{tab.name}}</li>\
                    </ul>\
                    <p :if="active.tips"><em></em>{{active.tips}}</p>\
                </div>',
      inheritAttrs: false,
      props: {
        tabs: { required: true, type: Array },
        active: { required: true },
      },
      emits: ['update:active'],
      methods: {
        select: function () {
          this.$emit('update:active', this.tab);
        },
      },
    };
  });

  registerComponent('ProductTable', function (ctx) {
    var sortStatus = [2, 0, 1],
      defulatSort = {
        column: '',
        direction: '',
      };

    return {
      template:
        '<div class="pro_list">\
                    <Loading :if="!products" delay={{200}}></Loading>\
                    <div :else-if="!pendding && !products.length && page==1" class="tips">暂无相关产品，请点击其他产品类型查看</div>\
                    <block :else>\
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">\
                            <tr>\
                                <th width="{{isDeposit?"27%":"33%"}}">产品名称</th>\
                                <th width="{{isDeposit?"14%":"20%"}}" class="col"><a @click="changeSort(1)" href="javascript:;">收益率<em class={{ sortIcon(1) }}></em></a></th>\
                                <th width="12%" class="col"><a @click="changeSort(3)" href="javascript:;">产品期限<em class={{ sortIcon(3) }}></em></a></th>\
                                <th :if="isDeposit" width="12%" class="col">到期日</th>\
                                <th width="12%" class="col"><a @click="changeSort(2)" href="javascript:;">起购金额<em class={{ sortIcon(2) }}></em></a></th>\
                                <th width="13%" class="col"><a @click="changeSort(4)" href="javascript:;">人气值<em class={{ sortIcon(4) }}></em></a></th>\
                                <th width="10%">操作</th>\
                            </tr>\
                        </table>\
                        <Loading :if="pendding" delay={{200}}></Loading>\
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">\
                            <block :for="(product, index) in products" key={{product.IvsmPd_ECD}}>\
                                <tr>\
                                    <td width="{{isDeposit?"27%":"33%"}}" class="td1">\
                                        <p class="name" @click="detail">{{product.Fnd_Nm}}</p>\
                                        <p class="fz12">{{ saleTips() || " " }}</p>\
                                        <div class="sold">\
                                            <span :if="saledRatio()!==null">已售{{saledRatio()}}%</span>\
                                            <span :else>不限额度</span>\
                                            <div><em style="{{ {"width":(saledRatio() || 0)+"%"} }}"></em></div>\
                                        </div>\
                                    </td>\
                                    <td width="{{isDeposit?"14%":"20%"}}" class="td2" :if="baseParam.Bkstg_PD_Tp_ECD!=\'01\'">\
                                        <p class="fz12">{{ Pft_Pcsg_Mod_MAP(product.Pft_Pcsg_Mod) || " " }}</p>\
                                        <p class="fz16 fz16_or {{ {standard:isStandard()} }}"\
                                            @mouseenter="hover($event,round(product.Exg_Pft_Cmnt))"\
                                            @mouseleave="hover"\
                                            :allow-html\
                                        >{{ autoEllipsis(round(product.Exg_Pft_Cmnt || " "), 193, isStandard()?14:16) }}</p>\
                                        <b :if="!isSelfPro">\
                                            产品成立日：{{formatDate(product.Inpt_SrtDt) }}\
                                        </b>\
                                    </td>\
                                    <td width="{{isDeposit?"14%":"20%"}}" class="td2" :else>\
                                        <p class="fz12">{{ product.Dsc_1 || "--" }}</p>\
                                        <p class="fz16 fz16_or {{ {standard:isStandard()} }}"\
                                            @mouseenter="hover($event,round(product.Exg_Pft_Cmnt))"\
                                            @mouseleave="hover"\
                                            :allow-html\
                                        >{{ autoEllipsis(round(product.Exg_Pft_Cmnt), 193, isStandard()?14:16) || "--" }}</p>\
                                        <p>{{product.Dt_Cmnt || "--" }}</p>\
                                        <b :if="!isSelfPro">\
                                            产品成立日：{{formatDate(product.Inpt_SrtDt) }}\
                                        </b>\
                                    </td>\
                                    <td width="12%" class="td3" valign="bottom">{{Ivs_Trm()}}</td>\
                                    <td :if="isDeposit" width="12%" class="td3" valign="bottom">{{product.Inpt_CODt}}</td>\
                                    <td width="12%" class="td3" valign="bottom">{{purchaseAmount()}}{{currencyUnit()}}起购</td>\
                                    <td width="13%" class="td4" valign="bottom">\
                                        <em :if="hotProductMap && hotProductMap[product.IvsmPd_ECD]!=void 0" class="{{["top"+hotProductMap[product.IvsmPd_ECD]]}}"></em>\
                                        <p>{{ format(product.Prblm_Dnum) }}人看过</p>\
                                    </td>\
                                    <td width="10%" class="td5" valign="bottom">\
                                        <div class="product_label">\
                                            <span :if="product.Rsk_Grd_Cd">{{Rsk_Grd_Cd_MAP(product.Rsk_Grd_Cd)}}</span>\
                                            <span :if="product.Fnd_Clsd_Opn_TpCd==7" style="margin-top:4px">现金管理产品</span>\
                                        </div>\
                                        <a class="buy {{{disable:!canBuy()}}}" @click="detail" href="javascript:;">{{buyBtnName()}}</a>\
                                    </td>\
                                </tr>\
                                <tr :if="tab.id!=8">\
                                    <td colspan="20" style="padding:0">\
                                        <业绩基准描述\
                                            expand={{true}}\
                                            Crt_Chnl_ID={{baseParam.Crt_Chnl_ID}}\
                                            PD_Sl_Obj_Cd={{baseParam.PD_Sl_Obj_Cd}}\
                                            FndCo_Agnc_Sale_InsID={{baseParam.FndCo_Agnc_Sale_InsID}}\
                                            product={{product}}\
                                        />\
                                    </td>\
                                </tr>\
                            </block>\
                        </table>\
                        <div :if="page && totalPage" class="licai_page">\
                            <span :if="page>1"><a href="javascript:;" class="page_btn" @click="goPage(page-1)">上一页</a></span>\
                            <span :if="frontPage>1" ><a href="javascript:;" @click="goPage(1)">1</a></span>\
                            <span :if="frontPage>2" class="dot">...</span>\
                            <span :for="pagenum in (frontPage ... endPage)"><a href="javascript:;" class={{{"cur":page==pagenum}}} @click="goPage(pagenum)">{{pagenum}}</a></span>\
                            <span :if="endPage<totalPage-1" class="dot">...</span>\
                            <span :if="endPage<totalPage"><a href="javascript:;" @click="goPage(totalPage)">{{totalPage}}</a></span>\
                            <span :if="totalPage>page"><a href="javascript:;" class="page_btn" @click="goPage(page+1)">下一页</a></span>\
                            <span>共<span>{{products.totalRec}}</span>条记录，当前第<font>{{page}}/{{totalPage}}</font>页</span>\
                            <span>到<input :ref="pageInput" @keyup="inputPagenum" type="text" />页</span>\
                            <a class="page_btn" href="javascript:;" :ref="confirm" @click="goPage()">确定</a>\
                        </div>\
                        <tooltip position="bottom"\
                            style={{{"max-width":"300px","text-align":"center"}}}\
                            arrowWidth={{20}}\
                            arrowHeight={{12}}\
                            borderColor="#1693F0"\
                            borderWidth={{1.5}}\
                            :ref="tooltip"\
                        ></tooltip>\
                    </block>\
                </div>',
      data: function () {
        return {
          products: null,
          totalPage: 0,
          page: 0,
          hotProductMap: null,
          sort: defulatSort,
          pendding: false,
          isSelfPro: true,
        };
      },
      props: {
        tab: {
          required: true,
          type: Object,
        },
        searchParam: {
          required: true,
          type: Object,
        },
        baseParam: {
          required: true,
          type: Object,
          validator: function (baseParam) {
            return [
              'Chnl_ID',
              'FndCo_Agnc_Sale_InsID',
              'Crt_Chnl_ID',
              'PD_Sl_Obj_Cd',
              'Bkstg_PD_Tp_ECD',
            ].every(function (param) {
              return param in baseParam;
            });
          },
        },
        detail_url: {
          type: String,
          default: './product_detail.html',
        },
        isSelf: {
          type: Boolean,
          default: false,
        },
      },
      mixins: [ProductsMixin],
      emits: ['totalCount'],
      methods: {
        formatDate: function (str) {
          if (str == null || str.length !== 8) return '-';
          return `${str.substr(0, 4)}/${str.substr(4, 2)}/${str.substr(6, 2)}`;
        },
        sortIcon: function (column) {
          return (
            (this.sort.column === column &&
              { 1: 'up', 2: 'down' }[this.sort.direction]) ||
            ''
          );
        },
        hover: function (e, content) {
          var elem = e.target,
            text = elem.innerText;

          if (!text || ~text.lastIndexOf('...')) {
            if (e.type === 'mouseenter') {
              this.$refs.tooltip.show(elem, content, elem.clientWidth / 2);
            } else if (e.type === 'mouseleave') {
              this.$refs.tooltip.hide();
            }
          }
        },
        changeSort: function (column) {
          var _self = this,
            sort =
              column != this.sort.column
                ? { column: column, direction: 2 }
                : {
                    column: this.sort.column,
                    direction: sortStatus[this.sort.direction],
                  };

          this.$setData('sort', sort);

          this.getProducts(1).then(function (products) {
            _self.$setData({
              products: products,
              page: products.currentPage,
              totalPage: products.totalPage,
            });
          });
        },
        buy: function (e) {
          var _class = e.target.getAttribute('class');
          if (_class && ~_class.indexOf('disable')) return;

          var product = this.product,
            baseParam = this.baseParam,
            Stk_TpCd = this.tab.id;

          if (
            baseParam.PD_Sl_Obj_Cd === '01' &&
            baseParam.Bkstg_PD_Tp_ECD === '04'
          ) {
            window.open(
              BuyHost$2 +
                '/CCBIS/V6/STY1/CN/login.jsp?' +
                ProductTool.depositBuyParam(product, baseParam.Bkstg_PD_Tp_ECD),
            );
          } else if (baseParam.PD_Sl_Obj_Cd === '10' && Stk_TpCd === '8') {
            window.open(
              BuyHost$3 +
                '/NCCB/NECV6PubQuery?CCB_IBSVersion=V6&PT_LANGUAGE=CN&PT_STYLE=6&resType=jsp&TXCODE=N90010&ATXCODE=NG101D&i18n=true',
            );
          } else if (baseParam.PD_Sl_Obj_Cd === '10') {
            window.open(
              BuyHost$1 +
                '/NCCB/NECV6PubQuery?CCB_IBSVersion=V6&PT_LANGUAGE=CN&PT_STYLE=6&resType=jsp&colorCSS=&TXCODE=N90010&USERID=&i18n=true&TTXCODE=6G1010&' +
                buyParam(),
            );
          } else {
            window.open('/cn/finance/products/product_buy.html?' + buyParam());
          }

          function buyParam() {
            return ProductTool.buyParam(
              product,
              baseParam.PD_Sl_Obj_Cd,
              baseParam.FndCo_Agnc_Sale_InsID,
              baseParam.Crt_Chnl_ID,
              Stk_TpCd,
              baseParam.Bkstg_PD_Tp_ECD,
            );
          }
        },
        getProducts: function (page) {
          var _self = this,
            baseParam = this.baseParam,
            sort = this.sort,
            sortParam =
              sort.direction != 0
                ? {
                    Seq_Mod_CgyCd: sort.column,
                    Seq_Fld_Ind: sort.direction,
                  }
                : null;

          this.$setData({ pendding: true });
          this.$setData({ isSelfPro: this.tab.id === '8' });

          return getProducts(
            this.tab.id,
            baseParam,
            this.searchParam,
            sortParam,
            page,
          ).then(function (products) {
            _self.$setData({ pendding: false });
            return products;
          });
        },
        detail: function (e) {
          if (this.isSelf == true) {
            window.open(
              '//www.ccb.com/chn/home/ydy/bankqr/index.shtml?menu=23&PRCT_CDE=' +
                this.product.IvsmPd_ECD,
            );
            return;
          }
          var _class = e.target.getAttribute('class');
          if (_class && ~_class.indexOf('disable')) return;

          var Txn_BO_ID = this.searchParam.Txn_BO_ID,
            Stk_TpCd = this.tab.id,
            product = this.product,
            IvsmPd_ECD = product.IvsmPd_ECD,
            Txn_Mkt_ID = product.Txn_Mkt_ID,
            PD_Sl_Obj_Cd = this.baseParam.PD_Sl_Obj_Cd,
            Bkstg_PD_Tp_ECD = this.baseParam.Bkstg_PD_Tp_ECD;

          sessionStorage.setItem(
            'finance_' + IvsmPd_ECD,
            JSON.stringify(product),
          );

          window.open(
            this.detail_url +
              '?' +
              $.param({
                IvsmPd_ECD: IvsmPd_ECD,
                Txn_BO_ID: Txn_BO_ID,
                Stk_TpCd: Stk_TpCd,
                Txn_Mkt_ID: Txn_Mkt_ID,
                PD_Sl_Obj_Cd: PD_Sl_Obj_Cd,
                Bkstg_PD_Tp_ECD: Bkstg_PD_Tp_ECD,
              }),
          );
        },
        inputPagenum: function (e) {
          var val = e.target.value,
            keyCode = e.keyCode;

          if (keyCode == 13) {
            this.goPage();
          } else if (isNaN(val)) {
            e.target.value = '';
          } else if (val < 1) {
            e.target.value = 1;
          } else if (val > this.totalPage) {
            e.target.value = this.totalPage;
          }
        },
        goPage: function (toPage) {
          var _self = this,
            page =
              toPage != void 0 ? toPage : Number(this.$refs.pageInput.value);

          page = Math.min(this.totalPage, Math.max(0, page));

          this.$setData({ products: [], page: page });

          this.getProducts(page).then(function (products) {
            _self.$setData({
              products: products,
            });
          });
        },
        saleTips: function () {
          var product = this.product,
            now = new Date(),
            nowYear = now.getFullYear();

          if (product.Stm_Src_Dsc == 1) {
            return product.Rs_StDt
              ? getDateDesc(product.Rs_StDt) + '即将发售'
              : '';
          } else if (product.SplLmt !== '' && product.SplLmt <= 0) {
            return '';
          } else if (
            product.Prod_Func_GRP.some(function (o) {
              return o.PD_Fcn_Cd == 2;
            })
          ) {
            if (ProductTool.isPrivate(product)) {
              return (
                '募集期至' +
                getDateTime(product.ChrgFee_Cyc_StDt, product.PROM_TIME_B)
              );
            }
            return product.Rs_EdDt
              ? '募集期至' + getDateDesc(product.Rs_EdDt)
              : '';
          } else {
            var openTypeNm =
              ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[product.Fnd_Clsd_Opn_TpCd];
            if (openTypeNm === '定期开放式') {
              var Ivs_StDt = product.Ivs_StDt,
                Ivs_CODt = product.Ivs_CODt,
                nowStr = now.parse('yyyyMMdd'),
                desc =
                  nowStr >= Ivs_StDt && nowStr <= Ivs_CODt
                    ? '开放申购中'
                    : '开放申购';
              return Ivs_StDt && Ivs_CODt
                ? getDateDesc(Ivs_StDt) + '-' + getDateDesc(Ivs_CODt) + desc
                : '';
            }
          }
          return '';

          function getDateTime(date, time) {
            var dateStr = getDateDesc(date),
              timeStr = time.replace(/(\d{2})(\d{2}).*/, '$1:$2');
            return dateStr + ' ' + timeStr;
          }

          function getDateDesc(date) {
            var matcher = date.match(/(\d{4})(\d{2})(\d{2})/),
              year = matcher[1],
              month = matcher[2],
              day = matcher[3];
            return year == nowYear
              ? month + '月' + day + '日'
              : year + '年' + month + '月' + day + '日';
          }
        },
        buyBtnName: function () {
          var product = this.product,
            buyInfo = ProductTool.buyInfo(product);

          return buyInfo.name;
        },
        canBuy: function () {
          var product = this.product,
            buyInfo = ProductTool.buyInfo(product);

          return buyInfo.state;
        },
      },
      computed: {
        frontPage: function () {
          return Math.max(this.page - 2, 1);
        },
        endPage: function () {
          return Math.min(this.page + 2, this.totalPage);
        },
        isDeposit: function () {
          return this.baseParam.Bkstg_PD_Tp_ECD === '04';
        },
      },
      receiveProps: function () {
        var _self = this;

        if (!this.tab) return;

        this.$setData({ products: null, sort: defulatSort, totalPage: 0 });

        this.getProducts(1).then(function (products) {
          var hotProductMap = _self.tab.hotIcon
            ? products.slice(0, 3).reduce(function (map, product, i) {
                map[product.IvsmPd_ECD] = i + 1;
                return map;
              }, {})
            : null;

          _self.$setData({
            products: products,
            page: products.currentPage,
            totalPage: products.totalPage,
            hotProductMap: hotProductMap,
          });

          _self.$emit('totalCount', products.totalRec);
        });
      },
      components: {
        tooltip: importComponent(
          'tooltip',
          '/cn/v3/js/components/component_base.js',
        ),
      },
    };

    function getProducts(tab_id, baseParam, searchParam, sortParam, page) {
      page = page || 1;

      return request({
        type: 'get',
        url: baseURL,
        dataType: 'json',
        data: Object.assign(
          {
            TXCODE: 'NLCQ11',
            Fcn_Cd: '0',
            REC_IN_PAGE: 10,
            PAGE_JUMP: page,
            Sel_StCd: tab_id,
          },
          searchParam,
          baseParam,
          sortParam,
        ),
      })
        .then(function (res) {
          var products = res.PROD_INFO_GRP;

          products.currentPage = +page;
          products.totalPage = +res.TOTAL_PAGE;
          products.totalRec = +res.TOTAL_REC;

          return products;
        })
        ['catch'](function () {
          var products = [];

          products.currentPage = page;
          products.totalPage = 0;
          products.totalRec = 0;

          return products;
        });
    }
  });

  /**
   * 详情组件
   */
  registerComponent('Product', function (ctx) {
    return {
      template: '<slot :if="product" product={{product}}></slot>',
      data: function () {
        return {
          product: null,
        };
      },
      store: ctx.store.provide(
        'IvsmPd_ECD',
        'Stk_TpCd',
        'Txn_BO_ID',
        'Chnl_ID',
        'Txn_Mkt_ID',
        'FndCo_Agnc_Sale_InsID',
        'Crt_Chnl_ID',
        'PD_Sl_Obj_Cd',
        'Bkstg_PD_Tp_ECD',
      ),
      methods: {
        getProduct: function () {
          var $store = this.$store,
            baseParam = {
              IvsmPd_ECD: $store.IvsmPd_ECD,
              Sel_StCd: $store.Stk_TpCd,
              Txn_BO_ID: $store.Txn_BO_ID,
              Chnl_ID: $store.Chnl_ID,
              Txn_Mkt_ID: $store.Txn_Mkt_ID,
              FndCo_Agnc_Sale_InsID: $store.FndCo_Agnc_Sale_InsID,
              Crt_Chnl_ID: $store.Crt_Chnl_ID,
              PD_Sl_Obj_Cd: $store.PD_Sl_Obj_Cd,
              Bkstg_PD_Tp_ECD: $store.Bkstg_PD_Tp_ECD,
            };

          return getProduct(baseParam);
        },
      },
      beforeMount: function () {
        var _self = this;

        this.getProduct().then(function (product) {
          _self.$setData('product', product);
        });
      },
    };

    function getProduct(baseParam) {
      return request({
        type: 'get',
        url: baseURL,
        dataType: 'json',
        data: Object.assign(
          {
            TXCODE: 'NLCQ11',
            Fcn_Cd: '0',
            REC_IN_PAGE: 1,
            PAGE_JUMP: 1,
          },
          baseParam,
        ),
      }).then(function (res) {
        var products = res.PROD_INFO_GRP;

        return products[0];
      });
    }
  });

  registerComponent('ProductInfo', function (ctx) {
    return {
      template:
        '<div class="de_l">\
                    <ul>\
                        <li :if="$store.Bkstg_PD_Tp_ECD == \'01\'">\
                            <p @mouseenter="hover($event, round(select_Pft.YldRto_Cmnt || product.Exg_Pft_Cmnt || "--"))"\
                                @mouseleave="hover"\
                                :allow-html\
                                class={{ {standard:isStandard} }}\
                            >{{autoEllipsis(round(select_Pft.YldRto_Cmnt || product.Exg_Pft_Cmnt || "--"),133,isStandard?14:24)}}<img @click="handlerShowPftCmntLsist($event)" :if="pftCmntLsist.length>0"  @mouseenter="hide()" style="padding: 0 10px;vertical-align: middle;cursor: pointer;" \
                            src="{{ upDownImg }}"> </p>\
                            <div class="pft_Cmnt_List" :if="isShowPftCmntList && pftCmntLsist.length>0">\
                            <block :for="(option,index) in pftCmntLsist">\
                                    <div class="label_radio {{ {r_on:selectIndex == index} }}" @click="handlerSelectPftCmnt(option,index)">{{option.Dsc_1}}\
                                    </div>\
                                </block>\
                            </div>\
                            <div class="profit_type" style="white-space: nowrap;">{{select_Pft.Dsc_1 || product.Dsc_1 ||"--"}}\
                                <div :if="Pft_Pcsg_Mod_Tips_MAP_NEW((select_Pft.Pft_Pcsg_Mod||product.Pft_Pcsg_Mod),product.Txn_Mkt_ID)" class="wenhao">\
                                    <img src="/cn/finance/products/images/licai/icon_wenhao.png"\
                                        @mouseenter="hover($event, Pft_Pcsg_Mod_Tips_MAP_NEW((select_Pft.Pft_Pcsg_Mod||product.Pft_Pcsg_Mod),product.Txn_Mkt_ID))"\
                                    >\
                                </div>\
                            </div>\
                            <div class = "pft_time ">\
                                {{select_Pft.Dt_Cmnt || product.Dt_Cmnt || "--"}}\
                            </div>\
                        </li>\
                        <li :else>\
                            <p @mouseenter="hover($event, round(product.Exg_Pft_Cmnt))"\
                                @mouseleave="hover"\
                                :allow-html\
                                class={{ {standard:isStandard} }}\
                            >{{autoEllipsis(round(product.Exg_Pft_Cmnt),133,isStandard?14:24)}}</p>\
                            <div class="profit_type">{{Pft_Pcsg_Mod_MAP(product.Pft_Pcsg_Mod)}}\
                                <div :if="Pft_Pcsg_Mod_Tips_MAP(product.Pft_Pcsg_Mod)" class="wenhao">\
                                    <img src="/cn/finance/products/images/licai/icon_wenhao.png"\
                                        @mouseenter="hover($event, Pft_Pcsg_Mod_Tips_MAP(product.Pft_Pcsg_Mod))"\
                                        @mouseleave="hover"\
                                    >\
                                </div>\
                            </div>\
                        </li>\
                        <li @mouseenter="hide()">\
                            <p style="color: #333;font-size:22px;"\
                                @mouseenter="hover($event,Ivs_Trm)"\
                                @mouseleave="hover"\
                                :allow-html\
                            >{{autoEllipsis(Ivs_Trm,133,24)}}</p>\
                            <div>投资期限</div>\
                        </li>\
                        <li>\
                            <p><span>{{purchaseAmount}}</span><i>{{currencyUnit}}</i></p>\
                            <div>起购金额</div>\
                        </li>\
                    </ul>\
					<div class="desc_container">\
                        <div class="desc_left">\
                            <p class="standard">产品成立日：{{formatDate(select_Pft.Inpt_SrtDt || product.Inpt_SrtDt)}}\</p>\
                        </div>\
					</div>\
                    <业绩基准描述\
                        :if="$store.Stk_TpCd!=8"\
                        expand={{true}}\
                        Crt_Chnl_ID={{$store.Crt_Chnl_ID}}\
                        PD_Sl_Obj_Cd={{$store.PD_Sl_Obj_Cd}}\
                        FndCo_Agnc_Sale_InsID={{$store.FndCo_Agnc_Sale_InsID}}\
                        product={{product}}\
                    />\
                    <div class="sold">\
                        <div class="grey_line"><em style="{{{"width":(saledRatio||0)+"%"}}}"></em></div>\
                        <div>\
                            <i :if="saledRatio!==null">已售{{saledRatio}}%</i>\
                            <i :else>不限额度</i>\
                            <span>（{{format(product.Prblm_Dnum)}}人次购买）</span>\
                        </div>\
                    </div>\
                    <slot></slot>\
                    <tooltip position="bottom"\
                        style={{{"max-width":toolWidth,"text-align":"left"}}}\
                        arrowWidth={{20}}\
                        arrowHeight={{12}}\
                        borderColor="#1693F0"\
                        borderWidth={{1.5}}\
                        :allow-html\
                        :ref="tooltip"\
                    ><div @mouseleave="hide($event)" :allow-html :if="$store.Bkstg_PD_Tp_ECD == \'01\'"><h3 style="text-align:center;">收益指标说明</h3>{{content||"提示框内容"}}</div></tooltip>\
                </div>\
                <style>\
                .tooltip__content__wrapper{\
                    z-index:1000;\
                }\
                .tooltip .tooltip__arrow[style_scope-1]{\
                    z-index:1001;\
                }\
                .tooltip__content img {\
                    vertical-align: middle;\
                    max-width: 100%;\
                }\
                </style>',
      store: ctx.store.provide(
        'Stk_TpCd',
        'Crt_Chnl_ID',
        'PD_Sl_Obj_Cd',
        'FndCo_Agnc_Sale_InsID',
        'Bkstg_PD_Tp_ECD',
      ),
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
      data: function () {
        return {
          content: '',
          isShowPftCmntList: false,
          pftCmntLsist: [],
          selectIndex: -1,
          select_Pft: {
            Pft_Pcsg_Mod: '',
            Dsc_1: '',
            YldRto_Cmnt: '',
            Dt_Cmnt: '',
            Pft_Pcsg_Mod: '',
          }, //选择展示的收益率
          toolWidth: '300px',
        };
      },
      mixins: [ProductMixin],
      computed: {
        upDownImg: function () {
          return this.isShowPftCmntList
            ? '/cn/finance/products/images/icon_up.png'
            : '/cn/finance/products/images/icon_down.png';
        },
      },
      beforeMount: function () {
        var _self = this;
        if (this.$store.Bkstg_PD_Tp_ECD == '01') {
          _self.$setData({ toolWidth: '600px' });
          this.getPftCmntLsist();
          this.pftCmntLsist.forEach(function (val, index) {
            if (_self.product.Dsc_1 == val.Dsc_1) {
              _self.$setData({ select_Pft: val });
            }
          });
        }
      },
      mounted: function () {
        // document.addEventListener("click", (e) => {
        //     var selectPftDialog = document.getElementsByClassName('pft_Cmnt_List')[0]
        //     if(selectPftDialog && this.isShowPftCmntList && !selectPftDialog.contains(e.target)){
        //         this.$setData({"isShowPftCmntList":false})
        //     }
        // },false)
      },
      methods: {
        formatDate: function (str) {
          if (str == null || str.length !== 8) return '-';
          return `${str.substr(0, 4)}/${str.substr(4, 2)}/${str.substr(6, 2)}`;
        },
        hover: function (e, content) {
          if (!this.$refs.tooltip) return;

          var elem = e.target,
            text = elem.innerText;
          if (!text || ~text.lastIndexOf('...')) {
            if (e.type === 'mouseenter') {
              this.$setData('content', content);
              this.$refs.tooltip.show(elem, content, elem.clientWidth / 2, 5);
            } else if (e.type === 'mouseleave') {
              this.$refs.tooltip.hide();
              this.$setData('content');
            }
          }
        },
        handlerSelectPftCmnt: function (option, index) {
          this.$setData({
            selectIndex: index,
            select_Pft: option,
          });
          this.$setData('isShowPftCmntList', !this.isShowPftCmntList);

          // Exg_Pft_Cmnt:ToolMethod.methods.autoEllipsis(ToolMethod.methods.round(option),133,ProductMixin.computed.isStandard?14:24),
        },
        handlerShowPftCmntLsist: function (e, contnet) {
          this.$setData('isShowPftCmntList', !this.isShowPftCmntList);
          return false;
        },
        hide: function (e) {
          this.$refs.tooltip.hide();
          this.$setData('content');
        },
        getPftCmntLsist: function () {
          var _self = this;
          // var RECOMMEND_RATE_LIST = [
          //     {
          //         Pft_Pcsg_Mod:'1',Dsc_1:'七日年化收益率',YldRto_Cmnt:'3.56%',Dt_Cmnt:'20240301-20240102区间'
          //     },
          //     {
          //         Pft_Pcsg_Mod:'2',Dsc_1:'近1月年化收益率',YldRto_Cmnt:'6.56%',Dt_Cmnt:'20240201-20240102区间'
          //     },
          //     {
          //         Pft_Pcsg_Mod:'3',Dsc_1:'近3月年化收益率',YldRto_Cmnt:'9.56%',Dt_Cmnt:'20240101-20240102区间'
          //     },
          //     {
          //         Pft_Pcsg_Mod:'4',Dsc_1:'近6月年化收益率',YldRto_Cmnt:'12.56%',Dt_Cmnt:'20230101-20240102区间'
          //     },

          // ]

          // _self.$setData({"pftCmntLsist":RECOMMEND_RATE_LIST})
          // return
          return request({
            url: baseURL,
            dataType: 'json',
            data: {
              TXCODE: 'NLCQ58',
              Fcn_Cd: 1,
              IvsmPd_ECD: this.product.IvsmPd_ECD,
              REC_IN_PAGE: 50,
              PAGE_JUMP: 1,
            },
          })
            .then(function (res) {
              // console.log(res)
              if (!res && !res.RECOMMEND_RATE_LIST) return;
              return res.RECOMMEND_RATE_LIST;
            })
            ['catch'](function () {
              return null;
            })
            .then(function (data) {
              // console.log(data)
              if (data) {
                _self.$setData('pftCmntLsist', data);
              }
            });
        },
      },
      components: {
        tooltip: importComponent(
          'tooltip',
          '/cn/v3/js/components/component_base.js',
        ),
      },
    };
  });

  registerComponent('ProductBuy', function (ctx) {
    return {
      template:
        '<div class="de_input" :bind="$attrs">\
                    <div>\
                        <input :model="amount" type="text" placeholder="请输入金额，{{purchaseAmount}}{{currencyUnit}}起购">\
                        <span>{{currencyUnit}}</span>\
                    </div>\
                    <a class="{{{disable:!canBuy}}}" @click="buy" href="javascript:;">立即购买</a>\
                </div>\
                <p style="margin-top: 10px;">{{buyTimeDesc}}</p>',
      inheritAttrs: false,
      data: function () {
        return {
          amount: '',
        };
      },
      props: {
        product: Object,
      },
      mixins: [ProductMixin],
      store: ctx.store.provide(
        'Stk_TpCd',
        'FndCo_Agnc_Sale_InsID',
        'Crt_Chnl_ID',
        'PD_Sl_Obj_Cd',
        'Bkstg_PD_Tp_ECD',
      ),
      computed: {
        canBuy: function () {
          var buyInfo = ProductTool.buyInfo(this.product);
          return (
            buyInfo.state &&
            this.amount >= ProductTool.purchaseAmount(this.product)
          );
        },
        buyTimeDesc: function () {
          return ProductTool.buyTimeDesc(this.product);
        },
      },
      methods: {
        buy: function (e) {
          var _class = e.target.getAttribute('class');
          if (_class && ~_class.indexOf('disable')) return;

          var product = this.product,
            $store = this.$store;

          if ($store.PD_Sl_Obj_Cd === '01' && $store.Bkstg_PD_Tp_ECD === '04') {
            window.open(
              BuyHost$2 +
                '/CCBIS/V6/STY1/CN/login.jsp?' +
                ProductTool.depositBuyParam(product, $store.Bkstg_PD_Tp_ECD),
            );
          } else if ($store.PD_Sl_Obj_Cd === '10' && $store.Stk_TpCd === '8') {
            window.open(
              BuyHost$3 +
                '/NCCB/NECV6PubQuery?CCB_IBSVersion=V6&PT_LANGUAGE=CN&PT_STYLE=6&resType=jsp&TXCODE=N90010&ATXCODE=NG101D&i18n=true',
            );
          } else if ($store.PD_Sl_Obj_Cd === '10') {
            window.open(
              BuyHost$1 +
                '/NCCB/NECV6PubQuery?CCB_IBSVersion=V6&PT_LANGUAGE=CN&PT_STYLE=6&resType=jsp&colorCSS=&TXCODE=N90010&USERID=&i18n=true&TTXCODE=6G1010&' +
                buyParam(),
            );
          } else {
            window.open(
              '//www.ccb.com/chn/home/ydy/bankqr/index.shtml?menu=23&PRCT_CDE=' +
                product.IvsmPd_ECD,
            );
            //window.open("/cn/finance/products/product_buy.html?" + buyParam())
          }

          function buyParam() {
            return ProductTool.buyParam(
              product,
              $store.PD_Sl_Obj_Cd,
              $store.FndCo_Agnc_Sale_InsID,
              $store.Crt_Chnl_ID,
              $store.Stk_TpCd,
              $store.Bkstg_PD_Tp_ECD,
            );
          }
        },
      },
    };
  });

  registerComponent('ProductDetail', function (ctx) {
    return {
      template:
        '<div class="de_con de_detail">\
                    <h3>产品详情</h3>\
                    <div>\
                        <ul>\
                            <li>\
                                <div class="ul_left">\
                                    <span>产品名称：</span>\
                                    <p>{{product.Fnd_Nm}}</p>\
                                </div>\
                                <div class="ul_right">\
                                    <span>产品编码：</span>\
                                    <p>{{product.IvsmPd_ECD}}</p>\
                                </div>\
                            </li>\
                            <li>\
                                <div :if="product.Pft_Pcsg_Mod" class="ul_left">\
                                    <span>{{Pft_Pcsg_Mod_MAP(product.Pft_Pcsg_Mod)}}：</span>\
                                    <p class={{ {standard:isStandard} }} >{{round(product.Exg_Pft_Cmnt)}}</p>\
                                </div>\
                                <div :show="name" class="ul_right">\
                                    <span>{{name}}：</span>\
                                    <p>{{product.Unit_Ast_NetVal}}</p>\
                                </div>\
                            </li>\
                            <业绩基准描述\
                                :if="$store.Stk_TpCd!=8"\
                                expand={{true}}\
                                Crt_Chnl_ID={{$store.Crt_Chnl_ID}}\
                                PD_Sl_Obj_Cd={{$store.PD_Sl_Obj_Cd}}\
                                FndCo_Agnc_Sale_InsID={{$store.FndCo_Agnc_Sale_InsID}}\
                                product={{product}}\
                            />\
                            <li>\
                                <div class="ul_left">\
                                    <span>投资期限：</span>\
                                    <p>{{Ivs_Trm}}</p>\
                                </div>\
                                <div class="ul_right">\
                                    <span>起购金额：</span>\
                                    <p>{{purchaseAmount}}{{currencyUnit}}</p>\
                                </div>\
                            </li>\
                            <li>\
                                <div class="ul_left">\
                                    <span>发行时间：</span>\
                                    <p>{{saleTime}}</p>\
                                </div>\
                                <div class="ul_right">\
                                    <span>风险等级：</span>\
                                    <p>{{Rsk_Grd_Cd_MAP(product.Rsk_Grd_Cd)}}</p>\
                                </div>\
                            </li>\
                            <li>\
                                <span>产品说明书：</span>\
                                <p>\
                                    <a :if="showAgreement" href="/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5&TXCODE=NXY002&xyCode=A0321XY00">《代销协议书》</a>\
                                    <a :if="showAgreement && product.Txn_Mkt_ID == \'0ZY1\'" href="{{agreement}}">《投资者权益须知》</a>\
                                    <a :if="showAgreement && product.Txn_Mkt_ID != \'0ZY1\'" href="{{agreement}}">《投资协议书及投资者权益须知》</a>\
                                    <a :if="product.Web_Acs_Rsc_URL" href="{{product.Web_Acs_Rsc_URL}}">《风险揭示与产品说明书》</a>\
                                    <a :if="$store.Stk_TpCd==\'1\'" href="/cn/OtherResource/agreement/FastRedeem_0JH.html">《快速赎回服务协议》</a>\
                                </p>\
                            </li>\
                        </ul>\
                    </div>\
                </div>',
      mixins: [ProductMixin],
      store: ctx.store.provide(
        'Stk_TpCd',
        'Txn_Mkt_ID',
        'PD_Sl_Obj_Cd',
        'Bkstg_PD_Tp_ECD',
        'type',
        'Crt_Chnl_ID',
        'PD_Sl_Obj_Cd',
        'FndCo_Agnc_Sale_InsID',
      ),
      data: function () {
        return {
          agreement: '',
        };
      },
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
      computed: {
        name: function () {
          if (this.$store.type === 'self') return;
          return this.product.Fnd_Clsd_Opn_TpCd == 7 ? '万份收益' : '单位净值';
        },
        saleTime: function () {
          var product = this.product,
            nowDate = new Date().parse('yyyyMMdd'),
            start,
            end;

          var Stdt =
              this.$store.type === 'self'
                ? product.Inpt_SrtDt
                : product.Ivs_StDt,
            CODt =
              this.$store.type === 'self'
                ? product.Inpt_CODt
                : product.Ivs_CODt,
            isPrivate = ProductTool.isPrivate(product);

          if (nowDate >= product.Rs_StDt && nowDate <= product.Rs_EdDt) {
            ((start = product.Rs_StDt),
              (end = isPrivate ? product.ChrgFee_Cyc_StDt : product.Rs_EdDt));
          } else if (nowDate >= Stdt && nowDate <= CODt) {
            ((start = Stdt),
              (end = isPrivate ? product.ChrgFee_Cyc_StDt : CODt));
          } else {
            return ' - ';
          }

          return [
            ProductTool.dateFormat(start, '.'),
            ProductTool.timeFormat(product.PROM_TIME_A),
            '-',
            ProductTool.dateFormat(end, '.'),
            ProductTool.timeFormat(product.PROM_TIME_B),
          ].join(' ');
        },
        showAgreement: function () {
          return (
            this.$store.Bkstg_PD_Tp_ECD !== '02' &&
            this.$store.Bkstg_PD_Tp_ECD !== '04'
          );
        },
      },
      beforeMount: function () {
        var Txn_Mkt_ID = this.$store.Txn_Mkt_ID;

        this.$setData(
          'agreement',
          {
            //"0JH": "/cn/OtherResource/agreement/20190628_1561709506.html",
            //"0ZY1": "/cn/OtherResource/agreement/rightNotice_ZY1.html",
            '0JH':
              '/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5&TXCODE=NXY002&xyCode=A0321XY24',
            '0ZY1':
              '/tran/WCCMainPlatV5?CCB_IBSVersion=V5&SERVLET_NAME=WCCMainPlatV5&TXCODE=NXY002&xyCode=A0321XY22',
            '0Y88': '/cn/OtherResource/agreement/mobile/rightNotice_0Y88.html',
            '0BK': '/cn/OtherResource/agreement/rightNotice_0BK.html ',
            '0HC': '/cn/OtherResource/agreement/rightNotice_0BK.html ',
          }[Txn_Mkt_ID] ||
            '/cn/OtherResource/agreement/rightNotice_' + Txn_Mkt_ID + '.html',
        );
      },
    };
  });

  registerComponent('ProductTimeline', function () {
    return {
      template:
        '<div :if="dots" class="de_con de_time">\
                    <h3>产品时间轴</h3>\
                    <div>\
                        <div class="de_line">\
                            <div :for="(dot, i) in dots" class="line_icon {{{grey:dot.isGrey,dotted:dot.dotted}}}" style={{{width:dot.pos+"%","z-index":999-i}}}>\
                                <div>\
                                    <span :for="desc in dot.bottomDesc">{{desc}}</span>\
                                </div>\
                                <div class="on_top">\
                                    <span :for="desc in dot.topDesc">{{desc}}</span>\
                                </div>\
                                <i></i>\
                            </div>\
                            <p :if="label" class="de_line_label" :allow-html>{{label}}</p>\
                        </div>\
                    </div>\
                    <p class="de_line_tips {{isShow}}" :allow-html>{{tips}}</p>\
                </div>',
      data: function () {
        return {
          dots: null,
          label: '',
          tips: '',
        };
      },
      props: {
        product: {
          required: true,
          type: Object,
        },
        genTimelineInfoDefs: Function,
      },
      computed: {
        isShow: function () {
          return /deposit/gm.test(location.href) ? 'hide' : '';
        },
      },
      beforeMount: function () {
        var product = this.product,
          Fnd_Clsd_Opn_TpCd = product.Fnd_Clsd_Opn_TpCd;

        if (Fnd_Clsd_Opn_TpCd) {
          var openTypeNm =
              ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[Fnd_Clsd_Opn_TpCd],
            today = toDate(new Date().parse('yyyyMMdd')), //当天零点
            StTm = ProductTool.timeFormat(product.StTm),
            EdTm = ProductTool.timeFormat(product.EdTm),
            PROM_TIME_B = ProductTool.timeFormat(product.PROM_TIME_B),
            timelineData = {
              today: today,
              StTm: StTm,
              EdTm: EdTm,
              Ivs_StDt: toDate(product.Ivs_StDt),
              Ivs_CODt: toDate(product.Ivs_CODt),
              ChrgFee_Cyc_StDt: toDate(product.ChrgFee_Cyc_StDt),
              Scrtz_Cfm_Dt: toDate(product.Scrtz_Cfm_Dt),
              Scrtz_Udo_Dt: toDate(product.Scrtz_Udo_Dt),
              IntAr_CODt: toDate(product.IntAr_CODt),
              date$Ivs_StDt_StTm:
                ProductTool.timelineDateFormat(product.Ivs_StDt, '/') +
                ' ' +
                StTm,
              date$Ivs_CODt_EdTm:
                ProductTool.timelineDateFormat(product.Ivs_CODt, '/') +
                ' ' +
                EdTm,
              date$ChrgFee_Cyc_StDt_PROM_TIME_B:
                ProductTool.timelineDateFormat(product.ChrgFee_Cyc_StDt, '/') +
                ' ' +
                PROM_TIME_B,
              date$Scrtz_Cfm_Dt: ProductTool.timelineDateFormat(
                product.Scrtz_Cfm_Dt,
                '/',
              ),
              date$Scrtz_Udo_Dt: ProductTool.timelineDateFormat(
                product.Scrtz_Udo_Dt,
                '/',
              ),
              date$IntAr_CODt: ProductTool.timelineDateFormat(
                product.IntAr_CODt,
                '/',
              ),
            },
            timelineInfoDefs = null;

          if (typeof this.genTimelineInfoDefs === 'function') {
            timelineInfoDefs = this.genTimelineInfoDefs(
              timelineData,
              createDot,
            );
          } else {
            with (timelineData) {
              timelineInfoDefs = {
                定期开放式: function () {
                  return {
                    dots: [
                      createDot('发起申购', date$Ivs_StDt_StTm, 0, Ivs_StDt),
                      createDot('开放日', date$Ivs_CODt_EdTm, 35, Ivs_CODt),
                      createDot(
                        '确认份额',
                        date$Scrtz_Cfm_Dt,
                        55,
                        Scrtz_Cfm_Dt,
                      ),
                      createDot(
                        '下一期可申购赎回',
                        date$Scrtz_Udo_Dt,
                        70,
                        Scrtz_Udo_Dt,
                      ),
                      createDot('', date$IntAr_CODt, 100, IntAr_CODt, 'dotted'),
                    ],
                    tips:
                      date$Ivs_StDt_StTm +
                      '-' +
                      date$Ivs_CODt_EdTm +
                      '为当前可发起申赎的指定时间段，在此时间段内可提出申购申请/追回申购申请/赎回申请',
                  };
                },
                封闭式: function () {
                  var profitDate = Scrtz_Cfm_Dt
                    ? new Date(+Scrtz_Cfm_Dt + 24 * 60 * 60 * 1000).parse(
                        'yyyy年MM月dd日',
                      )
                    : '';

                  return {
                    dots: [
                      createDot('开始销售', date$Ivs_StDt_StTm, 0, Ivs_StDt),
                      ProductTool.isPrivate(product) &&
                        createDot(
                          '进入冷静期',
                          date$ChrgFee_Cyc_StDt_PROM_TIME_B,
                          35,
                          ChrgFee_Cyc_StDt,
                        ),
                      createDot('截止销售', date$Ivs_CODt_EdTm, 55, Ivs_CODt),
                      createDot(
                        '产品成立',
                        date$Scrtz_Cfm_Dt,
                        70,
                        Scrtz_Cfm_Dt,
                      ),
                      createDot(
                        '产品到期',
                        date$Scrtz_Udo_Dt,
                        100,
                        Scrtz_Udo_Dt,
                      ),
                    ],
                    tips: ProductTool.isPrivate(product)
                      ? date$ChrgFee_Cyc_StDt_PROM_TIME_B +
                        '前购买，' +
                        date$ChrgFee_Cyc_StDt_PROM_TIME_B +
                        '进入冷静期（不能认购只能撤单），' +
                        date$Scrtz_Cfm_Dt +
                        '可查看持仓。'
                      : '产品成立当日确认份额。',
                    // '<span>'+profitDate + "开始计算理财收益</span>"
                  };
                },
                最低开放式: function () {
                  return {
                    dots: [
                      createDot('今日', '买入', 0, today),
                      createDot('确认份额', date$Scrtz_Cfm_Dt, 30),
                      createDot(
                        '满足最低持有期要求(可于开放日赎回)',
                        date$Scrtz_Udo_Dt,
                        70,
                      ),
                      createDot('连续投资', '', 100, null, 'dotted'),
                    ],
                    label:
                      '<span>最低持有' + product.ChnBnd_Bsn_Trm + '天</span>',
                    tips:
                      '每天<span>' +
                      StTm +
                      '-' +
                      EdTm +
                      '</span>点提出申购申请，份额于<span>T+' +
                      product.Cfm_Dys +
                      '</span>日（工作日，遇非工作日顺延至下一工作日）进行确认，申购资金<span>T</span>日（工作日，遇非工作日顺延至下一工作日）扣划。',
                  };
                },
              };
            }
          }

          var timelineInfoDef =
            timelineInfoDefs[openTypeNm] || timelineInfoDefs['*'];

          if (timelineInfoDef) {
            var timelineInfo = timelineInfoDef.call(this);

            this.$setData({
              dots: timelineInfo.dots.filter(Boolean),
              label: timelineInfo.label,
              tips: timelineInfo.tips,
            });
          }
        }

        function createDot(bottomDesc, topDesc, pos, date, dotted) {
          bottomDesc = bottomDesc instanceof Array ? bottomDesc : [bottomDesc];
          topDesc = topDesc instanceof Array ? topDesc : [topDesc];
          return {
            bottomDesc: bottomDesc,
            topDesc: topDesc,
            pos: pos,
            date: date,
            isGrey: !date || date > today,
            dotted: !!dotted,
          };
        }
        function toDate(dateString) {
          return dateString ? dateString.toDate('yyyyMMdd') : '';
        }
        function insertTodayDot(dots) {
          for (var i = 0; i < dots.length; i++) {
            var dot = dots[i];
            if (dot.date >= today) {
              if (i > 0) {
                var prevDot = dots[i - 1],
                  todayPos =
                    (((today - prevDot.date) / (dot.date - prevDot.date)) *
                      (dot.pos - prevDot.pos) +
                      prevDot.pos +
                      0.5) |
                    0;
                dots.splice(i, 0, createDot('今日', '', todayPos, today, true));
              } else if (+dot.date === +today) {
                dots.splice(i, 0, createDot('今日', '', 0, today, true));
              }
              break;
            }
          }
          return dots;
        }
      },
    };
  });

  registerComponent('ProductLightspot', function () {
    return {
      template:
        '<div :if="lightsopts.length" class="de_con de_point">\
                    <h3>产品亮点</h3>\
                    <div>\
                        <ul>\
                            <li :for="feature in lightsopts">\
                                <p>{{feature.title}}</p>\
                                <span @mouseenter="hover($event,feature.content)"\
                                    @mouseleave="hover"\
                                    :allow-html\
                                >{{autoEllipsis(feature.content,165,14)}}</span>\
                                <img src="images/licai/icon_01.png">\
                            </li>\
                        </ul>\
                    </div>\
                    <p :if="product.Ins_Cvr_Inf_Dsc">{{product.Ins_Cvr_Inf_Dsc}}\
                        <a :if="product.PgFc_Links_Adr" href="{{product.PgFc_Links_Adr}}" target="_blank">查看详情</a>\
                    </p>\
                    <div :if="product.Vd_Adr" class="de_video">\
                        <video width="475px" height="267px" controls="controls" src="{{product.Vd_Adr}}">您的浏览器不支持播放器</video>\
                    </div>\
                    <tooltip position="bottom"\
                        style={{{"max-width":"300px","text-align":"center"}}}\
                        arrowWidth={{20}}\
                        arrowHeight={{12}}\
                        borderColor="#1693F0"\
                        borderWidth={{1.5}}\
                        :ref="tooltip"\
                    ></tooltip>\
                </div>',
      data: function () {
        return {
          lightsopts: [],
        };
      },
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
      mixins: [ProductMixin],
      methods: {
        hover: function (e, content) {
          var elem = e.target,
            text = elem.innerText;
          if (!text || ~text.lastIndexOf('...')) {
            if (e.type === 'mouseenter') {
              this.$refs.tooltip.show(elem, content, $(elem).width() / 2, 5);
            } else if (e.type === 'mouseleave') {
              this.$refs.tooltip.hide();
            }
          }
        },
      },
      receiveProps: function () {
        if (!this.product || !this.product.Prod_Hig_Features_GPR) return;

        var lightsopts = this.product.Prod_Hig_Features_GPR.map(
          function (feature) {
            if (feature.Ntc_Msg_Ttl_Inf && feature.Rsrv_1) {
              return {
                title: feature.Ntc_Msg_Ttl_Inf,
                content: feature.Rsrv_1,
              };
            }
          },
        ).filter(Boolean);

        this.$setData('lightsopts', lightsopts);
      },
      components: {
        tooltip: importComponent(
          'tooltip',
          '/cn/v3/js/components/component_base.js',
        ),
      },
    };
  });

  registerComponent('ProductRule', function () {
    return {
      template:
        '<div :if="rules.length" class="de_con de_rule">\
                    <h3>交易规则</h3>\
                    <div>\
                        <div :for="(rule, index) in rules" :show="!isFold || index<2" class="de_rule_li">\
                            <span>{{rule.name}}</span>\
                            <p style="white-space: pre-line;">{{rule.detail}}</p>\
                        </div>\
                        <div :if="rules.length>2" class="rule_more">\
                            <a @click="toggleFold" class={{{btn_moreUP:!isFold}}} href="javascript:;">{{isFold?"展开更多":"收起更多"}}</a>\
                        </div>\
                    </div>\
                </div>',
      data: function () {
        return {
          isFold: false,
          rules: [],
        };
      },
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
      methods: {
        toggleFold: function () {
          this.$setData('isFold', !this.isFold);
        },
      },
      receiveProps: function () {
        var product = this.product,
          rules = [];

        product.Rmrk_1 &&
          rules.push({
            name: '购买规则',
            detail: product.Rmrk_1.replace(/@/g, '：').replace(/\|/g, '\n'),
          });
        product.Rmrk_3 &&
          rules.push({
            name: '赎回规则',
            detail: product.Rmrk_3.replace(/@/g, '：').replace(/\|/g, '\n'),
          });
        product.Rmrk_2 &&
          rules.push({
            name: '收益规则',
            detail: product.Rmrk_2.replace(/@/g, '：').replace(/\|/g, '\n'),
          });

        this.$setData({
          isFold: rules.length > 2,
          rules: rules,
        });
      },
    };
  });

  registerComponent('ProductQuestion', function () {
    return {
      template:
        '<div :if="questions.length" class="de_con de_problem">\
                    <h3>常见问题</h3>\
                    <div>\
                        <ul>\
                            <li :for="question in questions" @click="toggleFold" class="{{{active:!question.isFold}}}">\
                                <h4>{{question.title}}</h4>\
                                <p :show="!question.isFold">{{question.content}}</p>\
                            </li>\
                        </ul>\
                    </div>\
                </div>',
      data: function () {
        return {
          questions: [],
        };
      },
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
      methods: {
        toggleFold: function () {
          this.$setData('question.isFold', !this.question.isFold);
        },
      },
      receiveProps: function () {
        if (!this.product || !this.product.om_Problems) return;

        var questions = this.product.om_Problems
          .map(function (question) {
            if (question.Rsrv_2 && question.Spvs_Prvn_Dsc) {
              return {
                title: question.Rsrv_2,
                content: question.Spvs_Prvn_Dsc,
                isFold: true,
              };
            }
          })
          .filter(Boolean);

        this.$setData({ questions: questions });
      },
    };
  });
  registerComponent('ProductDetailTable', function (ctx) {
    return {
      template:
        '<div class="point de_con productDetailTable" :if="isShowTable">\
                        <h3>过往业绩</h3>\
                        <div class="de_ul">\
                            <ul>\
                                <li :for="type in tableTypes" key={{type.name}} class={{ {active:type==tableType} }} @click="selectTableType(type)">{{type.name}}</li>\
                            </ul>\
                        </div>\
                        <div class="de_all">\
                            <div class="de_all_list">\
                                <table border="0" cellspacing="0" cellpadding="0">\
                                    <thead>\
                                        <tr style="border-bottom: 1px solid #eee;"> \
                                            <th style="width: 50%;">时间区间</th>\
                                            <th style="width: 50%;">{{tableType.name}}</th>\
                                        </tr>\
                                    </thead>\
                                    <tbody>\
                                        <tr :for="(row, index) in rows" style="border-bottom: 1px solid #eee;">\
                                            <td style="text-align:center"><div>{{row[1]}}</div>{{row[0]}}</td>\
                                            <td style="text-align:center">{{row[2]}}</td>\
                                        </tr>\
                                    </tbody>\
                                </table>\
                            </div>\
                        </div>\
                        <div :if="page && totalPage" class="licai_page">\
                            <span :if="page>1"><a href="javascript:;" class="page_btn" @click="goPage(page-1)">上一页</a></span>\
                            <span :if="frontPage>1" ><a href="javascript:;" @click="goPage(1)">1</a></span>\
                            <span :if="frontPage>2" class="dot">...</span>\
                            <span :for="pagenum in (frontPage ... endPage)"><a href="javascript:;" class={{{"cur":page==pagenum}}} @click="goPage(pagenum)">{{pagenum}}</a></span>\
                            <span :if="endPage<totalPage-1" class="dot">...</span>\
                            <span :if="endPage<totalPage"><a href="javascript:;" @click="goPage(totalPage)">{{totalPage}}</a></span>\
                            <span :if="totalPage>page"><a href="javascript:;" class="page_btn" @click="goPage(page+1)">下一页</a></span>\
                            <span>共<span>{{totalRec}}</span>条记录，当前第<font>{{page}}/{{totalPage}}</font>页</span>\
                            <span>到<input :ref="pageInput" @keyup="inputPagenum" type="text" />页</span>\
                            <a class="page_btn" href="javascript:;" :ref="confirm" @click="goPage()">确定</a>\
                        </div>\
                        <div class="licai_tips">\
                            <span><em></em>\
                            理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。{{Fnd_Nm}}理财产品成立于{{Scrtz_Cfm_Dt}}，数据截止至{{NetVal_Dt}}，过往业绩相关数据已经托管人核对。数据来源：{{Inst_Nm}}\
                            </span>\
                        </div>\
                    </div>',
      data: function () {
        return {
          tableTypes: [
            { id: 1, name: '年化收益率', typeId: '07' },
            { id: 2, name: '涨跌幅', typeId: '07' },
            { id: 3, name: '特定收益率', typeId: '07' }, //typeId:数据处理的方式 product_public.js
          ],
          isShowTable: false,
          tableType: '',
          rows: null,
          page: 1,
          totalPage: 1,
          totalRec: 0,
          Fnd_Nm: '',
          Scrtz_Cfm_Dt: '',
          NetVal_Dt: '',
          Inst_Nm: '',
        };
      },
      computed: {
        frontPage: function () {
          return Math.max(this.page - 2, 1);
        },
        endPage: function () {
          return Math.min(this.page + 2, this.totalPage);
        },
      },
      store: ctx.store.provide('IvsmPd_ECD'),
      mounted: function () {
        this.selectTableType(this.tableTypes[0]);
      },
      methods: {
        goPage: function (toPage) {
          var _self = this,
            page =
              toPage != void 0 ? toPage : Number(this.$refs.pageInput.value);

          page = Math.min(this.totalPage, Math.max(0, page));

          this.$setData({ rows: [], page: page });

          this.getTableList(_self.tableType.id, page);
          // .then(function (rows) {
          //     _self.$setData({
          //         rows: rows
          //     })
          // })
        },
        selectTableType: function (type) {
          this.$setData({ tableType: type, page: 1 });
          this.getTableList(type.id, this.page);
        },
        getTableList: function (id, page) {
          var _self = this;

          return request({
            url: baseURL,
            dataType: 'json',
            data: {
              TXCODE: 'NLCQ58',
              IvsmPd_ECD: this.$store.IvsmPd_ECD,
              Fcn_Cd: 2,
              IvsChmtPd_YldRto_TpCd: id || 1,
              REC_IN_PAGE: 10,
              PAGE_JUMP: page,
            },
          })
            .then(function (res) {
              if (!res) return;
              _self.$setData({
                isShowTable: res.Txn_St == 1 ? true : false,
                totalPage: res.TOTAL_PAGE,
                totalRec: res.TOTAL_REC,
                Fnd_Nm: res.Fnd_Nm,
                Scrtz_Cfm_Dt: ProductTool.dateFormat(res.Scrtz_Cfm_Dt, '-'),
                NetVal_Dt: ProductTool.dateFormat(res.NetVal_Dt, '-'),
                Inst_Nm: ProductTool.dateFormat(res.Inst_Nm, '-'),
              });
              return res.RECOMMEND_RATE_LIST;
            })
            ['catch'](function () {
              return null;
            })
            .then(function (data) {
              var allRows = null;
              // console.log(data)
              //Txn_St 1显示 0 隐藏
              if (data) {
                allRows = data.map(function (item) {
                  return [item.Dt_Cmnt, item.Dsc_1, item.YldRto_Cmnt];
                });
              }

              _self.$setData({
                // "rowsInMore": allRows,
                // "rows": allRows && allRows.slice(0, 4)
                rows: allRows,
              });
            });
        },
      },
    };
  });
  registerComponent('ProductChart', function (ctx) {
    return {
      template:
        '<div :if="chartTypes" class="de_r">\
                    <div class="de_ul">\
                        <ul>\
                            <li :for="type in chartTypes" key={{type.name}} class={{{active:type==chartType}}} @click="selectChartType">{{type.name}}</li>\
                        </ul>\
                    </div>\
                    <div class="de_all">\
                        <div class="de_all_list">\
                            <block :if="shouldDraw">\
                                <ListTable :if="isList" chartType={{chartType}}></ListTable>\
                                <DateRangeChart :else chartType={{chartType}}></DateRangeChart>\
                            </block>\
                        </div>\
                    </div>\
                </div>\
                <div :else class="de_r chart_empty" style="height:349px;"></div>',
      data: function () {
        var chartTypes = ProductTool.getChartTypes(this.product);

        return {
          chartTypes: chartTypes,
          chartType: null,
          isShowPastList: false,
        };
      },
      props: {
        product: {
          required: true,
          type: Object,
        },
      },
      store: ctx.store.provide('IvsmPd_ECD', 'Bkstg_PD_Tp_ECD'),
      computed: {
        isList: function () {
          var chartType = this.chartType;

          return (
            chartType &&
            ['往期业绩', '区间收益', '过往业绩'].includes(chartType.name)
          );
        },
        shouldDraw: function () {
          return (
            this.product &&
            ProductDataMap.Fnd_Clsd_Opn_TpCd_Name[
              this.product.Fnd_Clsd_Opn_TpCd
            ] !== '封闭式'
          );
        },
      },
      methods: {
        selectChartType: function () {
          this.$setData('chartType', this.type || this.chartTypes[0]);
        },
        handlerIsShowPastTableList: function () {
          var _self = this;

          return request({
            url: baseURL,
            dataType: 'json',
            data: {
              TXCODE: 'NLCQ58',
              IvsmPd_ECD: this.$store.IvsmPd_ECD,
              Fcn_Cd: 2,
              IvsChmtPd_YldRto_TpCd: 1,
              REC_IN_PAGE: 10,
              PAGE_JUMP: 1,
            },
          }).then(function (res) {
            if (!res) return;
            _self.$setData({
              isShowPastList: res.Txn_St == '1' ? true : false,
            });
            var data = _self.chartTypes;
            if (_self.isShowPastList) {
              data = _self.chartTypes.filter(function (item) {
                return item.name != '区间收益' && item.name != '往期业绩';
              });
              data.push({ name: '过往业绩', id: 'X' });
            }
            _self.$setData('chartTypes', data);
          });
        },
      },
      beforeMount: function () {
        if (!this.chartTypes) return;
        // console.log(this.chartTypes,'chartTypes')
        this.selectChartType();
        if (this.$store.Bkstg_PD_Tp_ECD == '01') {
          this.handlerIsShowPastTableList();
        }
      },
      components: {
        ListTable: ListTable,
        DateRangeChart: DateRangeChart,
      },
    };

    function ListTable(ctx) {
      return {
        template:
          '<div style="text-align:center;" :if="rows || chartType.name == \'过往业绩\'" class="{{{productDetailTable:chartType.name == \'过往业绩\'}}}">\
                         <ul :if="chartType.name == \'过往业绩\'">\
                            <li :for="tableType in pastDataTypes" key={{tableType.name}} class={{{active:selectTableType.name==tableType.name}}} @click="handlerSelectTableType(tableType)">{{tableType.name}}</li>\
                        </ul>\
                        <p :if="headRow" class="de_table_head">\
                            <span :for="(headCell,i) in headRow" style={{cellStyle(i,headRow)}}>{{headCell}}</span>\
                        </p>\
                        <p :for="row in rows" class="de_table_row">\
                            <span :for="(cell,i) in row" style={{cellStyle(i,row)}} :allow-html>{{cell}}</span>\
                        </p>\
                        <p :if="showMore" style="text-align: right;">\
                            <span @click="more" style="cursor: pointer;font-size: 12px;color: #0066B3;">查看更多收益详情</span>\
                        </p>\
                        <div :if="chartType.name == \'过往业绩\'">\
                            <div :if="page && totalPage" class="licai_page">\
                                <span :if="page>1"><a href="javascript:;" class="page_btn" @click="goPage(page-1)">上一页</a></span>\
                                <span :if="frontPage>1" ><a href="javascript:;" @click="goPage(1)">1</a></span>\
                                <span :if="frontPage>2" class="dot">...</span>\
                                <span :for="pagenum in (frontPage ... endPage)"><a href="javascript:;" class={{{"cur":page==pagenum}}} @click="goPage(pagenum)">{{pagenum}}</a></span>\
                                <span :if="endPage<totalPage-1" class="dot">...</span>\
                                <span :if="endPage<totalPage"><a href="javascript:;" @click="goPage(totalPage)">{{totalPage}}</a></span>\
                                <span :if="totalPage>page"><a href="javascript:;" class="page_btn" @click="goPage(page+1)">下一页</a></span>\
                                <span>共<span>{{totalRec}}</span>条记录，当前第<font>{{page}}/{{totalPage}}</font>页</span>\
                                <span>到<input :ref="pageInput" @keyup="inputPagenum" type="text" />页</span>\
                                <a class="page_btn" href="javascript:;" :ref="confirm" @click="goPage()">确定</a>\
                            </div>\
                            <div class="licai_tips">\
                                <span><em></em>\
                                理财产品过往业绩不代表其未来表现，不等于理财产品实际收益，投资需谨慎。{{Fnd_Nm}}理财产品成立于{{Scrtz_Cfm_Dt}}，数据截止至{{NetVal_Dt}}，过往业绩相关数据已经托管人核对。数据来源：{{Inst_Nm}}\
                                </span>\
                            </div>\
                        </div>\
                    </div>',
        data: function () {
          return {
            rows: null,
            page: 1,
            totalPage: 0,
            totalRec: 0,
            Fnd_Nm: '',
            Scrtz_Cfm_Dt: '',
            NetVal_Dt: '',
            Inst_Nm: '',
            pastDataTypes: [
              { id: 1, name: '年化收益率' },
              { id: 2, name: '涨跌幅' },
              { id: 3, name: '特定收益率' },
            ],
            selectTableType: { id: 1, name: '年化收益率' },
          };
        },
        store: ctx.store.provide(
          'IvsmPd_ECD',
          'Txn_Mkt_ID',
          'FndCo_Agnc_Sale_InsID',
          'Bkstg_PD_Tp_ECD',
        ),
        props: {
          chartType: { required: true, type: Object },
        },
        computed: {
          frontPage: function () {
            return Math.max(this.page - 2, 1);
          },
          endPage: function () {
            return Math.min(this.page + 2, this.totalPage);
          },
          headRow: function () {
            var chartTypeNm = this.chartType.name;
            var selectTableTypeNm = this.selectTableType.name;
            if (chartTypeNm === '往期业绩') {
              this.getPrevPerformanceChartInfo();
              return ['周期区间', '年化收益率'];
            } else if (chartTypeNm === '区间收益') {
              this.getRangeChartInfo();
              return ['时间区间', '涨跌幅', '区间年化收益'];
            } else if (chartTypeNm === '过往业绩') {
              this.getPastTableList();
              return ['指标说明', '时间区间', selectTableTypeNm];
            }
          },
          showMore: function () {
            return (
              this.chartType.name !== '区间收益' &&
              this.chartType.name !== '过往业绩'
            );
          },
          cellWidth: function () {
            var c = this.headRow ? this.headRow.length : 1;
            return (100 / c).toFixed(2);
          },
        },
        methods: {
          cellStyle: function (i, row) {
            var textAlign =
              i === 0 ? 'left' : i === row.length - 1 ? 'right' : 'center';
            var fontSize =
              this.chartType.name == '过往业绩' ? 'font-size:12px' : '';
            return (
              'float:left;width:' +
              this.cellWidth +
              '%;text-align:' +
              textAlign +
              ';' +
              fontSize +
              ';'
            );
          },
          more: function () {
            window.open(
              './product_income.html?' +
                $.param({
                  IvsmPd_ECD: this.$store.IvsmPd_ECD,
                  Txn_Mkt_ID: this.$store.Txn_Mkt_ID,
                  FndCo_Agnc_Sale_InsID: this.$store.FndCo_Agnc_Sale_InsID,
                  PD_Grp_ECD: '40',
                  Ctrl_Ind_Cgy: this.chartType.id,
                }),
            );
          },
          getPrevPerformanceChartInfo: function () {
            var _self = this;

            return request({
              url: baseURL,
              dataType: 'json',
              data: {
                TXCODE: 'NLC162',
                IvsmPd_ECD: this.$store.IvsmPd_ECD,
                Txn_Mkt_ID: this.$store.Txn_Mkt_ID,
                FndCo_Agnc_Sale_InsID: this.$store.FndCo_Agnc_Sale_InsID,
                PD_Grp_ECD: '40',
              },
            })
              .then(function (res) {
                if (!res) return;
                return res.Index_Group;
              })
              ['catch'](function () {
                return null;
              })
              .then(function (data) {
                var rows = null;

                if (data) {
                  var chartTypeId = _self.chartType.id,
                    fotmatter =
                      ProductDataMap.ChartValueFormatter[chartTypeId] ||
                      function (v) {
                        return v;
                      },
                    symbol = ProductDataMap.ChartValueUnit[chartTypeId] || '';

                  rows = data.slice(0, 4).map(function (item) {
                    var date1 = item.Rmrk_1_Inf.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        '$1-$2-$3',
                      ),
                      date2 = item.Rmrk_2_Inf.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        '$1-$2-$3',
                      );
                    return [
                      date1 + '-' + date2,
                      fotmatter(item.Exp_YldRto) + symbol,
                    ];
                  });
                }

                _self.$setData('rows', rows);
              });
          },
          getRangeChartInfo: function () {
            var _self = this,
              twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            var date = twoDaysAgo.parse('yyyyMMdd');

            return request({
              url: baseURL,
              dataType: 'json',
              data: {
                TXCODE: 'NLC163',
                IvsmPd_ECD: this.$store.IvsmPd_ECD,
                Txn_Mkt_ID: this.$store.Txn_Mkt_ID,
                FndCo_Agnc_Sale_InsID: this.$store.FndCo_Agnc_Sale_InsID,
                PD_Grp_ECD: '40',
                Ctrl_Ind_Cgy: this.chartType.id,
                SrtDt: date,
                TmDt: date,
              },
            })
              .then(function (res) {
                if (!res) return;
                return res.Index_Group;
              })
              ['catch'](function () {
                return null;
              })
              .then(function (data) {
                var rows = null;

                if (data) {
                  var valuesById = data.reduce(function (valuesById, item) {
                    valuesById[item.Rmrk_1_Inf] = fixed(item.Exp_YldRto) + '%';
                    return valuesById;
                  }, {});

                  rows = [
                    ['近1月', cell('19'), cell('02')],
                    ['近3月', cell('20'), cell('03')],
                    ['近6月', cell('21'), cell('04')],
                    ['近1年', cell('22'), cell('05')],
                    ['成立以来', cell('24'), cell('07')],
                  ];

                  function cell(id) {
                    return (
                      "<strong style='color:#F21212;'>" +
                      (valuesById[id] || ' ') +
                      '</strong>'
                    );
                  }

                  function fixed(val) {
                    return Number(val * 100).toFixed(2);
                  }
                }

                _self.$setData('rows', rows);
              });
          },
          getPastTableList: function (id, page) {
            var _self = this;

            return request({
              url: baseURL,
              dataType: 'json',
              data: {
                TXCODE: 'NLCQ58',
                IvsmPd_ECD: this.$store.IvsmPd_ECD,
                Fcn_Cd: 2,
                IvsChmtPd_YldRto_TpCd: id || 1,
                REC_IN_PAGE: 5,
                PAGE_JUMP: page || 1,
              },
            })
              .then(function (res) {
                if (!res) return;
                _self.$setData({
                  totalPage: res.TOTAL_PAGE,
                  totalRec: res.TOTAL_REC,
                  Fnd_Nm: res.Fnd_Nm,
                  Scrtz_Cfm_Dt: ProductTool.dateFormat(res.Scrtz_Cfm_Dt, '-'),
                  NetVal_Dt: ProductTool.dateFormat(res.NetVal_Dt, '-'),
                  Inst_Nm: ProductTool.dateFormat(res.Inst_Nm, '-'),
                });
                return res.RECOMMEND_RATE_LIST || [];
              })
              ['catch'](function () {
                return null;
              })
              .then(function (data) {
                var allRows = [];
                //Txn_St 1显示 0 隐藏
                if (data) {
                  // var tableTypeId = _self.tableType.typeId,
                  //     fotmatter = ProductDataMap.ChartValueFormatter[tableTypeId] || function (v) { return v },
                  //     symbol = ProductDataMap.ChartValueUnit[tableTypeId] || ""

                  allRows = data.map(function (item) {
                    // var date1 = item.Rmrk_1_Inf.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"),
                    //     date2 = item.Rmrk_2_Inf.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
                    // return [item.Dt_Cmnt, fotmatter(item.YldRto_Cmnt) + symbol]
                    return [item.Dsc_1, item.Dt_Cmnt, item.YldRto_Cmnt];
                  });
                }

                _self.$setData({
                  // "rowsInMore": allRows,
                  // "rows": allRows && allRows.slice(0, 4)
                  rows: allRows,
                });
              });
          },
          goPage: function (toPage) {
            var _self = this,
              page =
                toPage != void 0 ? toPage : Number(this.$refs.pageInput.value);

            page = Math.min(this.totalPage, Math.max(0, page));

            this.$setData({ rows: [], page: page });

            this.getPastTableList(_self.selectTableType.id, page);
            // .then(function (rows) {
            //     _self.$setData({
            //         rows: rows
            //     })
            // })
          },
          handlerSelectTableType: function (type) {
            this.$setData({ selectTableType: type, page: 1 });
            this.getPastTableList(type.id, this.page);
          },
        },
      };
    }

    function DateRangeChart(ctx) {
      var now = new Date(),
        lastMonth = new Date(),
        last3Month = new Date(),
        lastYear = new Date(),
        last3Year = new Date();

      lastMonth.setMonth(now.getMonth() - 1);
      last3Month.setMonth(now.getMonth() - 3);
      lastYear.setFullYear(now.getFullYear() - 1);
      last3Year.setFullYear(now.getFullYear() - 3);

      return {
        template:
          '<ul>\
                        <li :for="range in dateRanges" key={{range.name}} class={{{active:range==dateRang}}} @click="selectDateRange">{{range.name}}</li>\
                    </ul>\
                    <p :if="chartInfo" style="text-align: right;">\
                        <span @click="more" style="cursor: pointer;font-size: 12px;color: #0066B3;">查看三年详情</span>\
                    </p>\
                    <div style="text-align: center;line-height: 245px;height:245px">\
                        <Chart :if="chartInfo" data={{chartInfo}}></Chart>\
                        <div :else class="chart_empty"></div>\
                    </div>',
        data: function () {
          return {
            dateRanges: [
              { name: '近一个月', endDate: now, startDate: lastMonth },
              { name: '近三个月', endDate: now, startDate: last3Month },
              { name: '近一年', endDate: now, startDate: lastYear },
              { name: '近三年', endDate: now, startDate: last3Year },
            ],
            dateRang: null,
            chartInfo: null,
          };
        },
        store: ctx.store.provide(
          'IvsmPd_ECD',
          'Txn_Mkt_ID',
          'FndCo_Agnc_Sale_InsID',
        ),
        props: {
          chartType: { required: true, type: Object },
        },
        methods: {
          more: function () {
            window.open(
              './product_income.html?' +
                $.param({
                  IvsmPd_ECD: this.$store.IvsmPd_ECD,
                  Txn_Mkt_ID: this.$store.Txn_Mkt_ID,
                  FndCo_Agnc_Sale_InsID: this.$store.FndCo_Agnc_Sale_InsID,
                  PD_Grp_ECD: '40',
                  Ctrl_Ind_Cgy: this.chartType.id,
                }),
            );
          },
          selectDateRange: function () {
            this.$setData('dateRang', this.range || this.dateRanges[0]);
            this.getChartInfo();
          },
          getChartInfo: function () {
            var _self = this,
              IvsmPd_ECD = this.$store.IvsmPd_ECD,
              Txn_Mkt_ID = this.$store.Txn_Mkt_ID,
              FndCo_Agnc_Sale_InsID = this.$store.FndCo_Agnc_Sale_InsID,
              PD_Grp_ECD = '40',
              Ctrl_Ind_Cgy = this.chartType.id;

            return request({
              url: baseURL,
              dataType: 'json',
              data: {
                TXCODE: 'NLCZST',
                IvsmPd_ECD: IvsmPd_ECD,
                Txn_Mkt_ID: Txn_Mkt_ID,
                FndCo_Agnc_Sale_InsID: FndCo_Agnc_Sale_InsID,
                PD_Grp_ECD: PD_Grp_ECD,
                Ctrl_Ind_Cgy: Ctrl_Ind_Cgy,
              },
            })
              .then(function (res) {
                var result = res && res.result === 'y';
                if (!result) return;

                var fileName =
                    IvsmPd_ECD +
                    Txn_Mkt_ID +
                    FndCo_Agnc_Sale_InsID +
                    PD_Grp_ECD +
                    Ctrl_Ind_Cgy,
                  chartUrl = '/newsinfo/finance/' + fileName + '.txt';

                return request({
                  type: 'get',
                  url: chartUrl,
                  dataType: 'json',
                }).then(function (res) {
                  if (!res) return;
                  return res.Index_Group;
                });
              })
              ['catch'](function () {
                return null;
              })
              .then(function (data) {
                var chartInfo = null,
                  dateRang = _self.dateRang;

                if (data) {
                  chartInfo = createChartInfo(
                    dateRangeFilter(data, dateRang.startDate, dateRang.endDate),
                    _self.chartType,
                    function (item, fotmatter) {
                      var date = item.Qtn_Dt.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        '$1-$2-$3',
                      );
                      return [date, fotmatter(item.Exp_YldRto)];
                    },
                  );
                }

                _self.$setData('chartInfo', chartInfo);
              });
          },
        },
        watch: {
          chartType: 'getChartInfo',
        },
        beforeMount: function () {
          this.selectDateRange();
        },
      };

      function dateRangeFilter(data, startDate, endDate) {
        var result = [],
          start = startDate.parse('yyyyMMdd'),
          end = endDate.parse('yyyyMMdd');

        for (var i = 0; i < data.length; i++) {
          var item = data[i],
            d = item.Qtn_Dt;
          if (d >= start && d <= end) {
            result.push(item);
          } else if (d > end) {
            break;
          }
        }

        return result;
      }
    }

    function createChartInfo(data, chartType, handler) {
      var Ctrl_Ind_Cgy = chartType.id,
        fotmatter =
          ProductDataMap.ChartValueFormatter[Ctrl_Ind_Cgy] ||
          function (v) {
            return v;
          },
        symbol = ProductDataMap.ChartValueUnit[Ctrl_Ind_Cgy] || '',
        list = data.map(function (item) {
          return handler(item, fotmatter, symbol);
        });

      return { name: chartType.name, list: list, symbol: symbol };
    }
  });

  registerComponent('Chart', function () {
    var chartInstance, symbol;

    return {
      template: '<div id="chart" style="height:100%;"></div>',
      props: {
        data: {
          required: true,
          type: Object,
        },
      },
      mounted: function () {
        chartInstance = echarts.init(document.querySelector('#chart'));
        symbol = this.data.symbol;
        chartInstance.setOption(createChartOption());
        chartInstance.setOption({
          series: {
            name: this.data.name,
            data: this.data.list,
          },
        });
      },
      receiveProps: function () {
        if (chartInstance) {
          symbol = this.data.symbol;
          chartInstance.setOption({
            series: {
              name: this.data.name,
              data: this.data.list,
            },
          });
        }
      },
    };

    function createChartOption() {
      return {
        color: ['#1693F0'],
        grid: {
          left: 10,
          top: 20,
          bottom: 50,
          containLabel: true,
        },
        tooltip: {
          renderMode: 'html',
          trigger: 'axis',
          backgroundColor: '#fff',
          borderColor: '#1693F0',
          borderWidth: 2,
          padding: 5,
          formatter: function (params) {
            var param = params[0],
              date = param.data[0],
              val = param.data[1];
            return (
              '<strong>' +
              date +
              '</strong><br>' +
              param.seriesName +
              '：' +
              val +
              symbol
            );
          },
          textStyle: {
            fontSize: 12,
            color: '#333',
          },
        },
        xAxis: {
          type: 'time',
          splitLine: {
            lineStyle: {
              opacity: 0.6,
            },
          },
          boundaryGap: ['20%', '20%'],
          axisLabel: {
            formatter: function (value) {
              var date = new Date(value);
              return [
                date.getFullYear(),
                fillzero(date.getMonth() + 1),
                fillzero(date.getDate()),
              ].join('-');
              function fillzero(v) {
                return ('00' + v).substr((v + '').length);
              }
            },
          },
        },
        yAxis: {
          type: 'value',
          scale: true,
          boundaryGap: ['20%', '20%'],
          axisLabel: {
            formatter: function (value) {
              return value + symbol;
            },
          },
        },
        series: {
          type: 'line',
          smooth: true,
          showSymbol: false,
          itemStyle: {
            normal: {
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(255,255,255,0)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(22,147,240,1)',
                    },
                  ],
                },
              },
            },
          },
        },
      };
    }
  });

  registerComponent('ProductInfoRight', function () {
    return {
      template:
        '<div class="de_r">\
                    <div style="height: 186px;background: rgba(248,248,248);display: table;width: 100%;text-align: center;">\
                        <div style="display: table-cell;vertical-align: middle;"><slot></slot></div>\
                    </div>\
                </div > ',
    };
  });

  registerComponent('业绩基准描述', function () {
    var leader = Promise.resolve();

    return {
      template:
        '<div class="desc_container">\
                    <div class="desc_left">\
                        <p class="standard">业绩比较基准：{{product.PfCmpBss}}</p>\
                        <p :if="fold || !detailDesc">{{product.IvsChmtPdPfCmpBss_Dsc||" "}}</p>\
                        <p :else>{{detailDesc}}</p>\
                        <p class="desc_tips">业绩比较基准不是预期收益率，不代表产品的未来表现和实际收益，不构成对产品收益的承诺</p>\
                    </div>\
                    <div :if="!expand" class="desc_right {{fold?"fold":""}}" @click="toggle"></div>\
                </div>',
      data: function () {
        return {
          fold: !this.expand,
          detailDesc: null,
        };
      },
      props: {
        expand: Boolean,
        product: Object,
        Crt_Chnl_ID: String,
        PD_Sl_Obj_Cd: String,
        FndCo_Agnc_Sale_InsID: String,
      },
      methods: {
        toggle: function () {
          this.$setData('fold', !this.fold);
        },
      },
      watch: {
        fold: {
          immediate: true,
          handler: function () {
            if (this.fold || this.detailDesc != null) return;

            this.$setData('detailDesc', '');

            var _self = this;

            leader = leader
              .then(function () {
                return request({
                  type: 'get',
                  url: baseURL,
                  dataType: 'json',
                  data: {
                    TXCODE: 'NLCQ05',
                    IvsmPd_ECD: _self.product.IvsmPd_ECD,
                    Crt_Chnl_ID: _self.Crt_Chnl_ID,
                    PD_Sl_Obj_Cd: _self.PD_Sl_Obj_Cd,
                    FndCo_Agnc_Sale_InsID: _self.FndCo_Agnc_Sale_InsID,
                  },
                }).then(function (res) {
                  _self.$setData('detailDesc', res.Prtm_Post_Dsc_Cmnt || ' ');
                });
              })
              .catch(Function.prototype);
          },
        },
      },
    };
  });
})();
