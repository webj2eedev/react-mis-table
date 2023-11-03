import { UNIQUER_ID_KEY, BATCH_COLUMN_KEY } from './Constants'
import { v4 as uuidv4 } from 'uuid'
import {
  normalizeOutputCell,
  normalizeOutputRow,
  normalizeOutputTable,
} from './normalizeOutput'
import { normalizeInputCellData } from './normalizeInput'
import { NeitThrone } from '..'

import type { NEditTableData } from './types'

export default class NEditTableImpl {
  dataArray: Record<string, any>[]
  columns: Record<string, any>[]
  fakeTailRowMode: boolean

  constructor(params: {
    data: Array<Record<string, any>>
    columns: Array<Record<string, any>>
    fakeTailRowMode: boolean
  }) {
    this.dataArray = params.data
    this.columns = params.columns
    this.fakeTailRowMode = params.fakeTailRowMode
  }

  getColumn = (colName: string) => {
    if (!colName) {
      throw new Error(`NEditTableData.getColumn入参colName为空！`)
    }

    for (let i = 0; i < this.columns.length; i++) {
      const tempColumn = this.columns[i]
      const { name } = tempColumn
      if (name?.toLowerCase() == colName.toLowerCase()) {
        return tempColumn
      }
    }

    return null
  }

  getNEditData = (): NEditTableData => {
    return {
      toArray: this.toArray,
      getRowData: this.getRowData,
      setRowData: this.setRowData,
      setCellValue: this.setCellValue,
      getCellValue: this.getCellValue,
      getCellContent: this.getCellContent,
      getSelectedRows: this.getSelectedRows,
      selectRow: this.selectRow,
      unSelectRow: this.unSelectRow,
      getSelectedRowData: this.getSelectedRowData,
      selectRows: this.selectRows,
      unSelectRows: this.unSelectRows,
      selectAll: this.selectAll,
      unSelectAll: this.unSelectAll,
      rowCount: this.rowCount,
    }
  }

  rowCount(): number {
    if (this.fakeTailRowMode) {
      return this.dataArray.length - 1
    } else {
      return this.dataArray.length
    }
  }

  toArray = (): Array<Record<string, any>> => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      return normalizeOutputTable(this.dataArray.slice(0, -1), this.columns)
    }

    return normalizeOutputTable(this.dataArray, this.columns)
  }

  getRowData = (rowNumber: number): Record<string, any> => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      if (rowNumber === this.dataArray.length) {
        throw new Error(`NEditTableData.getRowData[${rowNumber}]超出范围！`)
      }

      if (rowNumber === -1) {
        rowNumber = this.dataArray.length
      }
    }

    if (rowNumber < 1 || rowNumber > this.dataArray.length) {
      throw new Error(`NEditTableData.getRowData[${rowNumber}]超出范围！`)
    }

    return normalizeOutputRow(this.dataArray[rowNumber - 1], this.columns)
  }

  setRowData = (rowNumber: number, data: Record<string, any>) => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      if (rowNumber === this.dataArray.length) {
        throw new Error(`NEditTableData.setRowData[${rowNumber}]超出范围！`)
      }

      if (rowNumber === -1) {
        rowNumber = this.dataArray.length
      }
    }

    if (rowNumber < 0 || rowNumber > this.dataArray.length) {
      throw new Error(`NEditTableData.setRowData[${rowNumber}]超出范围！`)
    }
    // todo  根据columns的类型 标准化数据格式
    const newRowData = {}
    for (let i = 0; i < this.columns.length; i++) {
      const tempColumn = this.columns[i]
      const { type, format, name } = tempColumn
      const resultData = normalizeInputCellData(data[name], tempColumn)
      newRowData[name] = resultData
    }

    this.dataArray[rowNumber - 1] = {
      [UNIQUER_ID_KEY]: uuidv4(),
      ...newRowData,
    }
  }

  setCellValue = (
    rowNumber: number,
    colName: string,
    cellData: any,
    mask?: string
  ): void => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      if (rowNumber === this.dataArray.length) {
        throw new Error(`NEditTableData.setCellValue[${rowNumber}]超出范围！`)
      }

      if (rowNumber === -1) {
        rowNumber = this.dataArray.length
      }
    }

    if (rowNumber < 1 || rowNumber > this.dataArray.length) {
      throw new Error(`NEditTableData.setCellValue[${rowNumber}]超出范围！`)
    }
    if (!colName) {
      throw new Error(`NEditTableData.setCellValue入参colName为空！`)
    }
    const column = this.getColumn(colName)
    if (!column) {
      throw new Error(
        `NEditTableData.setCellValue不存在列名为[${colName}]的列！请检查！`
      )
    }
    const resultData = normalizeInputCellData(cellData, column, mask)
    this.dataArray[rowNumber - 1][colName] = resultData
    this.dataArray[rowNumber - 1][UNIQUER_ID_KEY] = uuidv4() //  重新生成 id  才会渲染UI
  }

  getCellValue = (rowNumber: number, colName: string): any => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      if (rowNumber === this.dataArray.length) {
        throw new Error(`NEditTableData.getCellValue[${rowNumber}]超出范围！`)
      }

      if (rowNumber === -1) {
        rowNumber = this.dataArray.length
      }
    }

    if (rowNumber < 1 || rowNumber > this.dataArray.length) {
      throw new Error(`NEditTableData.getCellValue[${rowNumber}]超出范围！`)
    }
    if (!colName) {
      throw new Error(`NEditTableData.getCellValue入参colName为空！`)
    }
    const column = this.getColumn(colName)
    if (!column) {
      throw new Error(
        `NEditTableData.getCellValue不存在列名为[${colName}]的列！请检查！`
      )
    }
    return normalizeOutputCell(this.dataArray[rowNumber - 1][colName], column)
  }

  getCellContent = (rowNumber: number, colName: string): string => {
    const column = this.getColumn(colName)
    if (
      column['type'] != 'SingleSelectColumn' &&
      column['type'] != 'MultiSelectColumn'
    ) {
      throw new Error(
        'NEditTableData.getCellContent 仅支持 [SingleSelectColumn、MultiSelectColumn] 列'
      )
    }

    let codes
    if (column.syscode) {
      codes = NeitThrone.getSysCode(column.syscode)
    } else if (column.jsoncode) {
      codes = column.jsoncode
    } else {
      throw new Error(`${colName}列上没有配置 code 或 jsoncode.`)
    }

    const cellValue = this.getCellValue(rowNumber, colName)
    if (cellValue == null || cellValue === '') {
      return ''
    }

    if (column['type'] === 'SingleSelectColumn') {
      const code = codes.find(code => code.value === cellValue)
      if (code) {
        return code.content
      }
      return `${cellValue}(?)`
    } else if (column['type'] === 'MultiSelectColumn') {
      return cellValue
        .split(',')
        .map(v => {
          const code = codes.find(code => code.value === v)
          if (code) {
            return code.content
          }
          return `${v}(?)`
        })
        .join(',')
    } else {
      throw new Error(
        `getCellContent 仅支持 [SingleSelectColumn、MultiSelectColumn] 列`
      )
    }
  }

  /*begin：batch数据接口*/
  // 获取选中行的行号
  getSelectedRows = (): number[] => {
    const nameArray = new Array<number>()

    for (let i = 0; i < this.dataArray.length; i++) {
      // 注：一定是get不出来尾行的选中状态
      // fakeTailMode
      if (this.fakeTailRowMode && i === this.dataArray.length - 1) {
        continue
      }

      const rowData = this.dataArray[i]
      if (rowData[BATCH_COLUMN_KEY] == '1') {
        nameArray.push(i + 1)
      }
    }

    return nameArray
  }
  // 选中某一行
  selectRow = (rowNumber: number) => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      if (rowNumber === -1) {
        throw new Error(
          `NEditTableData.fakeTailRowMode.selectRow.不能选中fakeTailRow`
        )
      }

      if (rowNumber === this.dataArray.length) {
        throw new Error(
          `NEditTableData.fakeTailRowMode.selectRow.不能选中fakeTailRow`
        )
      }
    }

    if (rowNumber < 1 || rowNumber > this.dataArray.length) {
      throw new Error(`NEditTableData.getCellValue[${rowNumber}]超出范围！`)
    }

    this.dataArray[rowNumber - 1][BATCH_COLUMN_KEY] = '1'
    this.dataArray[rowNumber - 1][UNIQUER_ID_KEY] = uuidv4() //  重新生成 id  才会渲染UI
  }
  // 取消选中某一行
  unSelectRow = (rowNumber: number) => {
    // fakeTailMode
    if (this.fakeTailRowMode) {
      if (rowNumber === -1) {
        throw new Error(
          `NEditTableData.fakeTailRowMode.unSelectRow.不能选中fakeTailRow`
        )
      }

      if (rowNumber === this.dataArray.length) {
        throw new Error(
          `NEditTableData.fakeTailRowMode.selectRow.不能选中fakeTailRow`
        )
      }
    }

    if (rowNumber < 1 || rowNumber > this.dataArray.length) {
      throw new Error(`NEditTableData.getCellValue[${rowNumber}]超出范围！`)
    }

    this.dataArray[rowNumber - 1][BATCH_COLUMN_KEY] = '0'
    this.dataArray[rowNumber - 1][UNIQUER_ID_KEY] = uuidv4() //  重新生成 id  才会渲染UI
  }

  // 获取选中行的数据
  getSelectedRowData = (): Array<Record<string, any>> => {
    const nameArray = new Array<Record<string, any>>()
    for (let i = 0; i < this.dataArray.length; i++) {
      // 注：一定是get不出来尾行的选中状态
      // fakeTailMode
      if (this.fakeTailRowMode && i === this.dataArray.length - 1) {
        continue
      }

      const rowData = this.dataArray[i]
      if (rowData[BATCH_COLUMN_KEY] == '1') {
        nameArray.push(rowData)
      }
    }

    return normalizeOutputTable(nameArray, this.columns)
  }

  selectRows = (rowNumbers: number[]) => {
    for (let i = 0; i < rowNumbers.length; i++) {
      const rowNumber = rowNumbers[i]
      this.selectRow(rowNumber)
    }
  }
  unSelectRows = (rowNumbers: number[]) => {
    for (let i = 0; i < rowNumbers.length; i++) {
      const rowNumber = rowNumbers[i]
      this.unSelectRow(rowNumber)
    }
  }
  selectAll = () => {
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.fakeTailRowMode && i === this.dataArray.length - 1) {
        continue
      }
      this.selectRow(i + 1)
    }
  }
  unSelectAll = () => {
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.fakeTailRowMode && i === this.dataArray.length - 1) {
        continue
      }
      this.unSelectRow(i + 1)
    }
  }
  /*end：batch数据接口*/
}
