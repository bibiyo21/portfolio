import { faCode } from '@fortawesome/free-solid-svg-icons'
import { describe, expect, it } from 'vitest'
import { skills } from './content-loader'
import { skillNameIcon } from './fa-icons'

describe('skill icons', () => {
  it('gives every skill in skills.yaml its own icon, not the fallback', () => {
    // Zend Framework has no fitting glyph, so it uses the code glyph on purpose.
    const missing = skills.categories
      .flatMap((c) => c.skills.map((s) => s.name))
      .filter((n) => n !== 'Zend Framework' && skillNameIcon(n) === faCode)
    expect(missing).toEqual([])
  })
})
