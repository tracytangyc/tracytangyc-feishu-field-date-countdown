"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const { t } = block_basekit_server_api_1.field;
const datedif_js_1 = require("./datedif.js");
const feishuDm = ['feishu.cn', 'feishuoutputn.com', 'larksuiteoutputn.com', 'larksuite.com'];
// 通过addDomainList添加请求接口的域名，不可写多个addDomainList，否则会被覆盖
block_basekit_server_api_1.basekit.addDomainList([...feishuDm, 'api.exchangerate-api.com',]);
block_basekit_server_api_1.basekit.addField({
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
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                placeholder: t('ph_ddl'),
                supportType: [block_basekit_server_api_1.FieldType.DateTime, block_basekit_server_api_1.FieldType.CreatedTime, block_basekit_server_api_1.FieldType.ModifiedTime],
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'format',
            label: t('label_format'),
            component: block_basekit_server_api_1.FieldComponent.Radio,
            defaultValue: {
                value: 1,
                label: t('tY') + t('tM') + t('tD')
            },
            props: {
                options: [
                    {
                        value: 1,
                        label: t('tY') + t('tM') + t('tD')
                    },
                    {
                        value: 2,
                        label: t('tY') + t('tM')
                    },
                    {
                        value: 3,
                        label: t('tM') + t('tD')
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
        type: block_basekit_server_api_1.FieldType.Object,
        extra: {
            icon: {
                light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/eqgeh7upeubqnulog/chatbot.svg',
            },
            properties: [
                {
                    key: 'id',
                    isGroupByKey: true,
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: 'id',
                    hidden: true,
                },
                {
                    key: 'countdown',
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: t('countdown'),
                    primary: true,
                },
            ],
        },
    },
    // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
    execute: async (formItemParams, context) => {
        const { ddl = null, format = 1 } = formItemParams;
        /** 为方便查看日志，使用此方法替代console.log */
        function debugLog(arg) {
            // @ts-ignore
            console.log(JSON.stringify({
                formItemParams,
                context,
                arg
            }));
        }
        try {
            if (formItemParams.ddl === undefined || formItemParams.ddl === null) {
                return {
                    code: block_basekit_server_api_1.FieldCode.Success,
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
                Y: (0, datedif_js_1.DateDif)(TODAY, DDL, 'Y'),
                M: (0, datedif_js_1.DateDif)(TODAY, DDL, 'M'),
                D: (0, datedif_js_1.DateDif)(TODAY, DDL, 'D'),
                YM: (0, datedif_js_1.DateDif)(TODAY, DDL, 'YM'),
                MD: (0, datedif_js_1.DateDif)(TODAY, DDL, 'MD'),
            };
            debugLog({
                '===1 接口返回结果 diff': diff
            }); // 输出日期差异，便于调试
            let output = '';
            if (diff.D < 0) {
                output = '❌' + t('expired');
            }
            else {
                if (diff.D === 0) {
                    output = '⚠️';
                }
                switch (formItemParams.format) {
                    case 1: // YMD
                        if (diff.D === 0) {
                            output += '0' + t('tD');
                        }
                        else {
                            output += diff.Y === 0 ? "" : diff.Y + t('tY');
                            output += diff.YM === 0 ? "" : diff.YM + t('tM');
                            output += diff.MD === 0 ? "" : diff.MD + t('tD');
                        }
                        break;
                    case 2: // YM
                        if (diff.M === 0) {
                            output += '0' + t('tM');
                        }
                        else {
                            output += diff.Y === 0 ? "" : diff.Y + t('tY');
                            output += diff.YM === 0 ? "" : diff.YM + t('tM');
                        }
                        break;
                    case 3: // MD
                        if (diff.D === 0) {
                            output += '0' + t('tD');
                        }
                        else {
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
                code: block_basekit_server_api_1.FieldCode.Success,
                data: {
                    id: `${Math.random()}`,
                    countdown: output,
                }
            };
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
        }
        catch (e) {
            console.log('====error', String(e));
            debugLog({
                '===999 异常错误': String(e)
            });
            /** 返回非 Success 的错误码，将会在单元格上显示报错，请勿返回msg、message之类的字段，它们并不会起作用。
             * 对于未知错误，请直接返回 FieldCode.Error，然后通过查日志来排查错误原因。
             */
            return {
                code: block_basekit_server_api_1.FieldCode.Error,
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBZ0o7QUFDaEosTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFDcEIsNkNBQXVDO0FBRXZDLE1BQU0sUUFBUSxHQUFHLENBQUMsV0FBVyxFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzdGLHFEQUFxRDtBQUNyRCxrQ0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLDBCQUEwQixFQUFFLENBQUMsQ0FBQztBQUVsRSxrQ0FBTyxDQUFDLFFBQVEsQ0FBQztJQUNmLGdCQUFnQjtJQUNoQixJQUFJLEVBQUU7UUFDSixRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLFdBQVcsRUFBRSxNQUFNO2dCQUNuQixRQUFRLEVBQUUsU0FBUztnQkFDbkIsY0FBYyxFQUFFLE9BQU87Z0JBQ3ZCLGlCQUFpQixFQUFFLFNBQVM7Z0JBQzVCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixTQUFTLEVBQUUsS0FBSztnQkFDaEIsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsSUFBSSxFQUFFLEdBQUc7YUFDVjtZQUNELE9BQU8sRUFBRTtnQkFDUCxNQUFNLEVBQUUsZ0JBQWdCO2dCQUN4QixPQUFPLEVBQUUsK0JBQStCO2dCQUN4QyxXQUFXLEVBQUUsVUFBVTtnQkFDdkIsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsY0FBYyxFQUFFLGtCQUFrQjtnQkFDbEMsaUJBQWlCLEVBQUUsbUJBQW1CO2dCQUN0QyxXQUFXLEVBQUUsV0FBVztnQkFDeEIsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLElBQUksRUFBRSxPQUFPO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE9BQU8sRUFBRSxnQkFBZ0I7Z0JBQ3pCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixjQUFjLEVBQUUsV0FBVztnQkFDM0IsaUJBQWlCLEVBQUUsYUFBYTtnQkFDaEMsV0FBVyxFQUFFLFNBQVM7Z0JBQ3RCLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixJQUFJLEVBQUUsR0FBRztnQkFDVCxJQUFJLEVBQUUsR0FBRztnQkFDVCxJQUFJLEVBQUUsR0FBRzthQUNWO1NBQ0Y7S0FDRjtJQUNELFVBQVU7SUFDVixTQUFTLEVBQUU7UUFDVDtZQUNFLEdBQUcsRUFBRSxLQUFLO1lBQ1YsS0FBSyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUM7WUFDckIsU0FBUyxFQUFFLHlDQUFjLENBQUMsV0FBVztZQUNyQyxLQUFLLEVBQUU7Z0JBQ0wsV0FBVyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQ3hCLFdBQVcsRUFBRSxDQUFDLG9DQUFTLENBQUMsUUFBUSxFQUFFLG9DQUFTLENBQUMsV0FBVyxFQUFFLG9DQUFTLENBQUMsWUFBWSxDQUFDO2FBQ2pGO1lBQ0QsU0FBUyxFQUFFO2dCQUNULFFBQVEsRUFBRSxJQUFJO2FBQ2Y7U0FDRjtRQUNEO1lBQ0UsR0FBRyxFQUFFLFFBQVE7WUFDYixLQUFLLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUN4QixTQUFTLEVBQUUseUNBQWMsQ0FBQyxLQUFLO1lBQy9CLFlBQVksRUFBRTtnQkFDWixLQUFLLEVBQUUsQ0FBQztnQkFDUixLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2FBQy9CO1lBQ0QsS0FBSyxFQUFFO2dCQUNMLE9BQU8sRUFBRTtvQkFDUDt3QkFDRSxLQUFLLEVBQUUsQ0FBQzt3QkFDUixLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO3FCQUMvQjtvQkFDRDt3QkFDRSxLQUFLLEVBQUUsQ0FBQzt3QkFDUixLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ3ZCO29CQUNEO3dCQUNFLEtBQUssRUFBRSxDQUFDO3dCQUNSLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztxQkFDdkI7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLENBQUM7d0JBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLENBQUM7d0JBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ2Y7b0JBQ0Q7d0JBQ0UsS0FBSyxFQUFFLENBQUM7d0JBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7cUJBQ2Y7aUJBQ0Y7YUFDRjtZQUNELFNBQVMsRUFBRTtnQkFDVCxRQUFRLEVBQUUsSUFBSTthQUNmO1NBQ0Y7S0FDRjtJQUNELGNBQWM7SUFDZCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsb0NBQVMsQ0FBQyxNQUFNO1FBQ3RCLEtBQUssRUFBRTtZQUNMLElBQUksRUFBRTtnQkFDSixLQUFLLEVBQUUsNkVBQTZFO2FBQ3JGO1lBQ0QsVUFBVSxFQUFFO2dCQUNWO29CQUNFLEdBQUcsRUFBRSxJQUFJO29CQUNULFlBQVksRUFBRSxJQUFJO29CQUNsQixJQUFJLEVBQUUsb0NBQVMsQ0FBQyxJQUFJO29CQUNwQixLQUFLLEVBQUUsSUFBSTtvQkFDWCxNQUFNLEVBQUUsSUFBSTtpQkFDYjtnQkFDRDtvQkFDRSxHQUFHLEVBQUUsV0FBVztvQkFDaEIsSUFBSSxFQUFFLG9DQUFTLENBQUMsSUFBSTtvQkFDcEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUM7b0JBQ3JCLE9BQU8sRUFBRSxJQUFJO2lCQUNkO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsMkRBQTJEO0lBQzNELE9BQU8sRUFBRSxLQUFLLEVBQUUsY0FBK0IsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMxRCxNQUFNLEVBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDO1FBQ2xELGlDQUFpQztRQUNqQyxTQUFTLFFBQVEsQ0FBQyxHQUFRO1lBQ3hCLGFBQWE7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3pCLGNBQWM7Z0JBQ2QsT0FBTztnQkFDUCxHQUFHO2FBQ0osQ0FBQyxDQUFDLENBQUE7UUFDTCxDQUFDO1FBQ0QsSUFBSSxDQUFDO1lBQ0gsSUFBSSxjQUFjLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxjQUFjLENBQUMsR0FBRyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNwRSxPQUFPO29CQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLE9BQU87b0JBQ3ZCLElBQUksRUFBRTt3QkFDSixFQUFFLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO3dCQUN4QixTQUFTLEVBQUUsRUFBRTtxQkFDZDtpQkFDRixDQUFDO1lBQ0osQ0FBQztZQUVELDBCQUEwQjtZQUMxQixJQUFJLE9BQU8sY0FBYyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDOUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUVELE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDbkQsTUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFNBQVM7WUFDbkMsSUFBSSxJQUFJLEdBQUc7Z0JBQ1QsQ0FBQyxFQUFFLElBQUEsb0JBQU8sRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDM0IsQ0FBQyxFQUFFLElBQUEsb0JBQU8sRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDM0IsQ0FBQyxFQUFFLElBQUEsb0JBQU8sRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDM0IsRUFBRSxFQUFFLElBQUEsb0JBQU8sRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQztnQkFDN0IsRUFBRSxFQUFFLElBQUEsb0JBQU8sRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQzthQUM5QixDQUFDO1lBRUYsUUFBUSxDQUFDO2dCQUNQLGtCQUFrQixFQUFFLElBQUk7YUFDekIsQ0FBQyxDQUFDLENBQUMsY0FBYztZQUVsQixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFFaEIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNmLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlCLENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ2pCLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ0QsUUFBTyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzdCLEtBQUssQ0FBQyxFQUFFLE1BQU07d0JBQ1osSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOzRCQUNqQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDMUIsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDL0MsTUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNqRCxNQUFNLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ25ELENBQUM7d0JBQ0QsTUFBTTtvQkFDUixLQUFLLENBQUMsRUFBRSxLQUFLO3dCQUNYLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzs0QkFDakIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzFCLENBQUM7NkJBQU0sQ0FBQzs0QkFDTixNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQy9DLE1BQU0sSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDbkQsQ0FBQzt3QkFDRCxNQUFNO29CQUNSLEtBQUssQ0FBQyxFQUFFLEtBQUs7d0JBQ1gsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOzRCQUNqQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDMUIsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDL0MsTUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNuRCxDQUFDO3dCQUNELE1BQU07b0JBQ1IsS0FBSyxDQUFDLEVBQUUsSUFBSTt3QkFDVixNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzNCLE1BQU07b0JBQ1IsS0FBSyxDQUFDLEVBQUUsSUFBSTt3QkFDVixNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzNCLE1BQU07b0JBQ1IsS0FBSyxDQUFDLEVBQUUsSUFBSTt3QkFDVixNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzNCLE1BQU07b0JBQ1I7d0JBQ0UsTUFBTTtnQkFDVixDQUFDO1lBQ0gsQ0FBQztZQUVELE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFdkIscUVBQXFFO1lBQ3JFLFFBQVEsQ0FBQztnQkFDUCxhQUFhLEVBQUUsTUFBTTthQUN0QixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLElBQUksRUFBRSxvQ0FBUyxDQUFDLE9BQU87Z0JBQ3ZCLElBQUksRUFBRTtvQkFDSixFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQ3RCLFNBQVMsRUFBRSxNQUFNO2lCQUNsQjthQUNGLENBQUE7WUFFRDs7Ozs7Ozs7Ozs7O2NBWUU7UUFDSixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFFBQVEsQ0FBQztnQkFDUCxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUN6QixDQUFDLENBQUM7WUFDSDs7ZUFFRztZQUNILE9BQU87Z0JBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsS0FBSzthQUN0QixDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFDSCxrQkFBZSxrQ0FBTyxDQUFDIn0=