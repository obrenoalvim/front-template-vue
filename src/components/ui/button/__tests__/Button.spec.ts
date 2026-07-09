import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button, buttonVariants } from '..'

describe('Button', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
  })

  it('applies the default variant classes', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toEqual(buttonVariants().split(' '))
  })

  it('renders as a different element when "as" is set', () => {
    const wrapper = mount(Button, { props: { as: 'a' } })
    expect(wrapper.element.tagName).toBe('A')
  })
})
