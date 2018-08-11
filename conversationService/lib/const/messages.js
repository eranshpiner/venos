module.exports = {
  WELCOME: ({context, customer}) => ({
    elements: {
      title: `${customer.title}`,
      image_url: customer.logo,
      //subtitle : customer.desc90,
      subtitle : customer.desc90,
    },
  }),
  ORDER_DETAILS: {
    DELIVERY: {
      METHOD: ({context, customer, deliveryOptions}) => ({
        text: 'לפני שנתחיל בתהליך ההזמנה, אנא בחר את שיטת משלוח',
        quickReplies: deliveryOptions,
      }),
      METHOD_RETRY: ({context, customer, deliveryOptions}) => ({
        text: 'אנא בחר משלוח או איסוף עצמי',
        quickReplies: deliveryOptions,
      }),
      SHIPPING: {
        CONFIRM: ({context: { deliveryInfo }}) => ({
          text: `המשלוח ישלח לכתובת הבאה:\nעיר: ${deliveryInfo.city}\nרחוב: ${deliveryInfo.street}\nמס׳ בית/קומה/כניסה: ${deliveryInfo.houseNumber}\n* תוכל/י לשנות את פרטים אלו בסיום ההזמנה.`
        }),
        ADDRESS: {
          ENTER_ADDRESS: ({context, customer, api}) => ({
            text: 'אנא שתף את מיקומך או הזן את הכתובת למשלוח\nלמשל דיזנגוף 22 תל אביב',
            quickReplies: [api.createShareLocation()],
          }),
          APPROVE_ADDRESS: ({context, address}) => ({
            text: `זהינו שהכתובת שהכנסת היא ${address}\nאנא אשר שהכתובת נכונה`,
            quickReplies: ['כן, זאת הכתובת שלי', 'לא, תקן כתובת'],
          }),
          CHOOSE_ADDRESS: ({context, address}) => ({
            text: 'מצאנו מספר תוצאות לכתובת שהכנסת\n אנא בחר מאחת הכתובת הבאות:',
            quickReplies: address.map(address => address),
          }),
          NO_ADDRESS: ({context}) => ({
            text: 'לא הצלחנו לזהות את הכתובת שהכנסת, ננסה שוב',
          }),
          MANUAL: {
            CITY: {
              ENTER_CITY: ({context}) => ({
                text: 'לאיזו עיר תרצה את המשלוח?',
                quickReplies: ['תל אביב', 'הרצליה', 'רמת גן', 'גבעתיים'],
              }),
              RETRY_CITY: ({context}) => ({
                text: 'לא הצלחנו לזהות את העיר שהכנסת, אנא נסה שנית',
                quickReplies: ['תל אביב', 'הרצליה', 'רמת גן', 'גבעתיים'],
              }),
              CHOOSE_CITY: ({context, cities}) => ({
                text: 'מצאנו מספר ערים, אנא בחר מהערים הבאות',
                quickReplies: cities,
              }),
            },
            STREET: {
              ENTER_STREET: ({context}) => ({
                text: 'לאיזו רחוב תרצה את המשלוח?',
              }),
              RETRY_STREET: ({context}) => ({
                text: 'לא הצלחנו לזהות את הרחוב שהכנסת, אנא נסה שנית',
              }),
              CHOOSE_STREET: ({context, streets}) => ({
                text: 'מצאנו מספר רחובות, אנא בחר מהרחובות הבאים',
                quickReplies: streets,
              }),

            }
          },
          FLOOR_APT_ENT: ({context}) => ({
            text: 'מהו מספר הדירה, קומה ו/או כניסה?'
          }),
        },
      },
      PICKUP: {
        ACKNOWLEDGE: ({context}) => ({
          text: 'בסיום ההזמנה תוכל לבחור את הזמן שבו ההזמנה תחכה לך בסניף',
        }),
      }
    },
  },
  ORDER: {
    CATEGORY: {
      CHOOSE_CATEGORY: ({context, categories}) => ({
        text: 'בחר קטגוריה',
        quickReplies: categories,
      }),
      RETRY_CATEGORY: ({context, categories}) => ({
        text: 'זאת קטגורה שאינני מכיר, אנא בחר את הקטגוריות הבאות',
        quickReplies: categories,
      }),
      CATEGORY_DESCRIPTION: ({context, description}) => ({
        text: description,
      }),
      CHOOSE_ITEM: ({context, items}) => ({
        elements: items,
      }),
      RETRY_ITEM: ({context, categories}) => ({
        text: 'זה פריט שאינני מכיר, אנא בחר מאחד הפריטים למעלה, או מהקטגוריות הבאות',
        quickReplies: categories,
      }),
      OR_CHOOSE_ANOTHER_CATEGORY: ({context, categories}) => ({
        text: 'למעלה תוכל למצוא את המנות שבקטגוריה שבחרת או פשוט תבחר קטגוריה אחרת',
        quickReplies: categories,
      }),
    },
    ITEM: {
      CUSTOMIZATIONS: {
        CHOOSE_SINGLE_TITLE: ({context, title}) => ({
          text: title,
        }),
        CHOOSE_SINGLE_ITEMS: ({context, items, replies}) => ({
          elements: items,
          quickReplies: replies,
        }),
        CHOOSE_MULTIPLE_ITEMS: ({context, title, items}) => ({
          text: title,
          quickReplies: items,
        }),
        RETRY_CHOICES: ({context}) => ({
          text: 'אינני מכיר את האופציה שהכנסת, אנא בחר מהרשימה.',
        }),
      },
      EDIT: {
        CHOOSE_ACTION: ({context, item, actions}) => ({
          text: `מה תרצה לשנות עבור פריט ${item.name}?`,
          quickReplies: actions,
        }),
        RETRY_ACTION: ({context, item, actions}) => ({
          text: 'זו פעולה שאני לא מכיר, אנא בחר את אחד הפעולות הבאות או הקש "חזרה"',
          quickReplies: actions,
        }),
        SUCCESSFULLY_INCREASED: ({context, item}) => ({
          text:  `הוספתי ${item.name} נוסף, סה"כ ${item.quantity}`,
        }),
        SUCCESSFULLY_REDUCED: ({context, item}) => ({
          text: `הסרתי את  ${item.name} בהורדתי את הכמות ל ${item.quantity}.`,
        }),
        SUCCESSFULLY_REMOVED: ({context, item}) => ({
          text: `מחקתי את  ${item.name} מהעגלה .`,
        }),
      },
      COMMENTS: ({context}) => ({
        text: 'במידה וישנם הערות נוספות למנה, אנא רשום אותם כעת',
        quickReplies: ['לא צריך'],
      }),
      SUCCESSFULLY_ADDED: ({context, item}) => ({
        text: `${item.name} התווסף לעגלה.`,
      }),
    },
  },
  CART: {
    EMPTY: ({context, categories}) => ({
      text: 'עוד לא בחרת כלום. בוא נתחיל! בחר קטגוריה',
      quickReplies: categories,
    }),
    CART_ITEMS: ({context, items, buttons}) => ({
      listType: 'vertical',
      elements: items,
      buttons,
    }),
    CART_TOTAL: ({context, items, total, categories}) => ({
      text: `סה"כ ${items} פריטים על סך ${total}₪`,
      quickReplies: categories,
    }),
  },
  RESET: {
    SUCCESSFULLY_RESET: () => ({
      text: 'אין בעיה, בוא נתחיל מההתחלה.'
    }),
  }
};
