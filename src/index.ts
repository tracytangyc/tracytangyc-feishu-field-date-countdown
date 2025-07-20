import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;
import { DateDif } from './datedif.js';

const feishuDm = ['feishu.cn', 'feishuoutputn.com', 'larksuiteoutputn.com', 'larksuite.com'];
// 通过addDomainList添加请求接口的域名，不可写多个addDomainList，否则会被覆盖
basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com',]);

basekit.addField({
  // 定义捷径的i18n语言资源
  i18n: {
    messages: {
      'zh-CN': {
        "name": "日期倒计时",
        "label": "根据截止日期计算倒计时",
        "label_ddl": "截止日期",
        "ph_ddl": "请选择日期字段",
        "label_format": "倒计时格式",
        "errmsg_ddl_null": "未找到截止日期",
        "countdown": "倒计时",
        "expired": "已过期",
        "tY": "年",
        "tM": "月",
        "tD": "天"
      },
      'en-US': {
        "name": "Date Countdown",
        "label": "Date countdown until deadline",
        "label_ddl": "Deadline",
        "ph_ddl": "Please select a date field",
        "label_format": "Countdown format",
        "errmsg_ddl_null": "No deadline found",
        "countdown": "Countdown",
        "expired": "Expired",
        "tY": "years",
        "tM": "months",
        "tD": "days"
      },
      'ja-JP': {
        "name": "日付カウントダウン",
        "label": "締切までの日付カウントダウン",
        "label_ddl": "締切日",
        "ph_ddl": "日付フィールドを選択してください",
        "label_format": "カウントダウン形式",
        "errmsg_ddl_null": "締切日が見つかりません",
        "countdown": "カウントダウン",
        "expired": "期限切れ",
        "tY": "年",
        "tM": "月",
        "tD": "日",
      },
    }
  },
  // 定义捷径的入参
  formItems: [
    {
      key: 'ddl',
      label: t('label_ddl'),
      component: FieldComponent.FieldSelect,
      props: {
        placeholder: t('ph_ddl'),
        supportType: [FieldType.DateTime, FieldType.CreatedTime, FieldType.ModifiedTime],
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'format',
      label: t('label_format'),
      component: FieldComponent.Radio,
      defaultValue: {
        value: 1,
        label: t('tY')+t('tM')+t('tD')
      },
      props: {
        options: [
          {
            value: 1,
            label: t('tY')+t('tM')+t('tD')
          },
          {
            value: 2,
            label: t('tY')+t('tM')
          },
          {
            value: 3,
            label: t('tM')+t('tD')
          },
          {
            value: 4,
            label: t('tY')
          },
          {
            value: 5,
            label: t('tM')
          },
          {
            value: 6,
            label: t('tD')
          },
        ]
      },
      validator: {
        required: true,
      }
    }
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Object,
    extra: {
      icon: {
        light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/eqgeh7upeubqnulog/chatbot.svg',
      },
      properties: [
        {
          key: 'id',
          isGroupByKey: true,
          type: FieldType.Text,
          title: 'id',
          hidden: true,
        },
        {
          key: 'countdown',
          type: FieldType.Text,
          title: t('countdown'),
          primary: true,
        },
      ],
    },
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (formItemParams: { ddl, format }, context) => {
    const { ddl = null, format = 1 } = formItemParams;
    /** 为方便查看日志，使用此方法替代console.log */
    function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        formItemParams,
        context,
        arg
      }))
    }
    try {
      if (formItemParams.ddl === undefined || formItemParams.ddl === null) {
        return {
          code: FieldCode.Success,
          data: {
            id: t('errmsg_ddl_null'),
            countdown: '',
          }
        };
      }

      // 如果format不是数字类型，则设置为默认值1
      if (typeof formItemParams.format !== 'number') {
        formItemParams.format = 1;
      }

      const DDL = new Date(formItemParams.ddl); // 获取截止日期
      const TODAY = new Date(); // 获取当前时间
      let diff = {
        Y: DateDif(TODAY, DDL, 'Y'),
        M: DateDif(TODAY, DDL, 'M'),
        D: DateDif(TODAY, DDL, 'D'),
        YM: DateDif(TODAY, DDL, 'YM'),
        MD: DateDif(TODAY, DDL, 'MD'),
      };
      
      debugLog({
        '===1 接口返回结果 diff': diff
      }); // 输出日期差异，便于调试
      
      let output = '';

      if (diff.D < 0) {
        output = '❌' + t('expired');
      } else {
        if (diff.D === 0) {
          output = '⚠️';
        }
        switch(formItemParams.format) {
          case 1: // YMD
            if (diff.D === 0) {
              output += '0' + t('tD');
            } else {
              output += diff.Y === 0 ? "" : diff.Y + t('tY');
              output += diff.YM === 0 ? "" : diff.YM + t('tM');
              output += diff.MD === 0 ? "" : diff.MD + t('tD');
            }
            break;
          case 2: // YM
            if (diff.M === 0) {
              output += '0' + t('tM');
            } else {
              output += diff.Y === 0 ? "" : diff.Y + t('tY');
              output += diff.YM === 0 ? "" : diff.YM + t('tM');
            }
            break;
          case 3: // MD
            if (diff.D === 0) {
              output += '0' + t('tD');
            } else {
              output += diff.M === 0 ? "" : diff.M + t('tM');
              output += diff.MD === 0 ? "" : diff.MD + t('tD');
            }
            break;
          case 4: // Y
            output += diff.Y + t('tY');
            break;
          case 5: // M
            output += diff.M + t('tM');
            break;
          case 6: // D
            output += diff.D + t('tD');
            break;
          default:
            break;
        }
      }

      output = output.trim();

      // 请避免使用 debugLog(res) 这类方式输出日志，因为所查到的日志是没有顺序的，为方便排查错误，对每个log进行手动标记顺序
      debugLog({
        '===2 接口返回结果': output
      });

      return {
        code: FieldCode.Success,
        data: {
          id: `${Math.random()}`,
          countdown: output,
        }
      }

      /*
        如果错误原因明确，想要向使用者传递信息，要避免直接报错，可将错误信息当作成功结果返回：

      return {
        code: FieldCode.Success,
        data: {
          id: `具体错误原因`,
          usd: 0,
          rate: 0,
        }
      }

      */
    } catch (e) {
      console.log('====error', String(e));
      debugLog({
        '===999 异常错误': String(e)
      });
      /** 返回非 Success 的错误码，将会在单元格上显示报错，请勿返回msg、message之类的字段，它们并不会起作用。
       * 对于未知错误，请直接返回 FieldCode.Error，然后通过查日志来排查错误原因。
       */
      return {
        code: FieldCode.Error,
      }
    }
  },
});
export default basekit;