import { describe, expect, it, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/renderApp'

describe('StatusPage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('показва "Не си логнат" без активна сесия', () => {
    renderApp('/status')

    expect(screen.getByText('Не си логнат')).toBeInTheDocument()
  })
})
