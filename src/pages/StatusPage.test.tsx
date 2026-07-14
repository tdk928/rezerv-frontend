import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { StatusPage } from './StatusPage'

describe('StatusPage', () => {
  it('показва "Не си логнат" без активна сесия', () => {
    renderWithProviders(<StatusPage />, { path: '/' })

    expect(screen.getByText('Не си логнат')).toBeInTheDocument()
  })
})
