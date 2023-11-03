import { dateFormatStandard } from './dateFormatUtils'
import { number2standard, numberAccMul } from './number2string'
import moment from 'moment'

export function normalizeInputCellData(
  cellData: any,
  column,
  mask?: string
): any {
  const { type: colType, format, name: colName, head } = column

  // 不管入参是不是null， CheckboxColumn列都要将数据初始化为0/1
  if (colType === 'CheckboxColumn' || colType === 'BatchColumn') {
    if (cellData == null || cellData === '') {
      cellData = '0'
    } else if (cellData === 0 || cellData === '0') {
      cellData = '0'
    } else if (cellData === 1 || cellData === '1') {
      cellData = '1'
    } else {
      const msg = `NEditTableData入参${colName}列为CheckboxColumn类型,设置value${cellData}类型不正确！可以设置的类型为['', null, 0, 1, '0', '1']请检查!`
      throw new Error(msg)
    }
  } else if (colType === 'NumberColumn') {
    if (cellData == null || cellData == undefined || cellData === '') {
      return null
    }

    const newData = Number(
      number2standard(
        column.percentage ? numberAccMul(cellData, 100) : cellData,
        column.precision
      )
    )
    if (isNaN(cellData)) {
      throw new Error(
        `NEditTableData设置值的列${head}列为NumberColumn类型,value[${cellData}]不能转换为number类型,请检查！`
      )
    }
    return newData
  } else if (colType === 'DateColumn') {
    if (cellData == null || cellData == undefined) {
      return null
    }

    if (cellData instanceof Date) {
      cellData = moment(cellData)
    } else if (cellData instanceof moment) {
      // 无需处理
    } else if (typeof cellData == 'string') {
      if (cellData == '') {
        return null
      }

      if (mask) {
        cellData = moment(cellData, dateFormatStandard(mask))
      } else if (column.sourceFormat) {
        cellData = moment(cellData, dateFormatStandard(column.sourceFormat))
      } else if (format) {
        cellData = moment(cellData, dateFormatStandard(format))
      } else {
        throw new Error(
          `NEditTableData设置值入参${colName}列为DateColumn类型,value${cellData}为string类型，需要设置入参mask或者column上设置format！`
        )
      }
    } else if (typeof cellData == 'number') {
      // 认定cellData的值为【19700101】的格式
      cellData = cellData.toString()

      if (mask) {
        cellData = moment(cellData, dateFormatStandard(mask))
      } else if (column.sourceFormat) {
        cellData = moment(cellData, dateFormatStandard(column.sourceFormat))
      } else if (format) {
        cellData = moment(cellData, dateFormatStandard(format))
      } else {
        throw new Error(
          `NEditTableData设置值入参${colName}列为DateColumn类型,value${cellData}为number类型，需要设置入参mask或者column上设置format！`
        )
      }
    } else {
      throw new Error(
        `NEditTableData入参${colName}列为DateColumn类型,设置value${cellData}类型不正确！可以设置的类型为[string | Date | moment]请检查!`
      )
    }
  } else {
    if (cellData == null || cellData == undefined) {
      return ''
    }

    return cellData
  }

  return cellData
}
