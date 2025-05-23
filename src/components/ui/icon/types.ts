import { type ElementType } from 'react'

export type IconType =
  | 'mistral'
  | 'gemini'
  | 'aws'
  | 'azure'
  | 'anthropic'
  | 'groq'
  | 'fireworks'
  | 'deepseek'
  | 'cohere'
  | 'ollama'
  | 'xai'
  | 'bignoodle'
  | 'user'
  | 'agent'
  | 'open-ai'
  | 'sheet'
  | 'nextjs'
  | 'shadcn'
  | 'tailwind'
  | 'reasoning'
  | 'bignoodle-tag'
  | 'refresh'
  | 'edit'
  | 'save'
  | 'x'
  | 'arrow-down'
  | 'send'
  | 'download'
  | 'hammer'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'plus-icon'
  | 'references'
  | 'trash'

export interface IconProps {
  type: IconType
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'dot' | 'xxs' | 'default'
  className?: string
  color?: string
  disabled?: boolean
}

export type IconTypeMap = {
  [key in IconType]: ElementType
}
