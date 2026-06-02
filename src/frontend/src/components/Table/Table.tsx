import { useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import { Button } from '../Button'

export interface Column<T> {
  key: keyof T
  label: string
  icon?: string
  render?: (value: T[keyof T], row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  actions?: boolean
}

export function Table<T extends { id: string | number }>({ columns, data, pageSize = 10, actions = true }: TableProps<T>) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(data.length / pageSize)
  const paginated = data.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="TableContainer">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)}>
                {col.icon && <Icon name={col.icon} />}
                <span>{col.label}</span>
              </th>
            ))}
            {actions && <th style={{ width: '1px', whiteSpace: 'nowrap' }}></th>}
          </tr>
        </thead>
        <tbody>
          {paginated.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
              {actions && (
                <td style={{ width: '1px', whiteSpace: 'nowrap' }}>
                  <Button density='high' type='circle' icon='delete' hierarchy='tertiary' />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="BottomRow">
          <Button
            type="circle"
            icon="chevron_left"
            hierarchy="tertiary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
          />
          <span>{page} de {totalPages}</span>
          <Button
            type="circle"
            icon="chevron_right"
            hierarchy="tertiary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </div>
  )
}