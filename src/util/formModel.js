const model = {
  newGuestModel: [
    {
      label: '新規',
      value: 0
    },
    {
      label: '既存',
      value: 1
    },
  ],
  optionModel: [
    {
      label: '女性',
      value: 1
    },
    {
      label: '男性',
      value: 2
    },
    {
      label: 'その他',
      value: 3
    }
  ],
  reservationModel: [
    {
      label: '自社HP',
      value: 1
    },
    {
      label: 'XXXXXXX',
      value: 2
    },
    {
      label: 'XXXXXXX',
      value: 3
    },
    {
      label: 'XXXXXXX',
      value: 4
    },
    {
      label: '電話',
      value: 5
    },
  ],
  checkinModel: [
    {
      label: '未',
      value: 0
    },
    {
      label: '済',
      value: 1
    }
  ],
  couponModel: [
    {
      label: '未',
      value: 0
    },
    {
      label: '有',
      value: 1
    },
    {
      label: '無',
      value: 2
    }
  ],
  paymentStatusModel: [
    {
      label: '未',
      value: 0
    },
    {
      label: '済',
      value: 1
    }
  ],
  paymentMethodModel: [
    {
      label: 'クレジット',
      value: 0
    },
    {
      label: '現金',
      value: 1
    },
    {
      label: '振り込み',
      value: 2
    },
    {
      label: 'コンビニ',
      value: 3
    }
  ],
  statusCodeModel: [
    {
      label: '宿泊中',
      value: 1
    },
    {
      label: 'チェックアウト済',
      value: 2
    },
    {
      label: 'キャンセル',
      value: 3
    }
  ],
  hasChildModel: [
    {
      label: '無',
      value: 0
    },
    {
      label: '有',
      value: 1
    }
  ],
}

export default model
