'use client'

import { useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

import type {
  UnorderedListProps,
  OrderedListProps,
  EmphasizedTextProps,
  ItalicTextProps,
  StrongTextProps,
  BoldTextProps,
  DeletedTextProps,
  UnderlinedTextProps,
  HorizontalRuleProps,
  BlockquoteProps,
  AnchorLinkProps,
  HeadingProps,
  ImgProps,
  ParagraphProps
} from './types'

import { PARAGRAPH_SIZES } from '../Paragraph/constants'
import MermaidRenderer from './MermaidRenderer'

const filterProps = (props: object) => {
  const newProps = { ...props }

  if ('node' in newProps) {
    delete newProps.node
  }

  return newProps
}

const UnorderedList = ({ className, ...props }: UnorderedListProps) => (
  <ul
    className={cn(
      className,
      PARAGRAPH_SIZES.lead,
      'flex list-disc flex-col pl-10'
    )}
    {...filterProps(props)}
  />
)

const OrderedList = ({ className, ...props }: OrderedListProps) => (
  <ol
    className={cn(
      className,
      PARAGRAPH_SIZES.lead,
      'flex list-decimal flex-col pl-10'
    )}
    {...filterProps(props)}
  />
)

const Paragraph = ({ className, ...props }: ParagraphProps) => (
  <p className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const EmphasizedText = ({ className, ...props }: EmphasizedTextProps) => (
  <em
    className={cn(className, 'PARAGRAPH_SIZES.lead')}
    {...filterProps(props)}
  />
)

const ItalicText = ({ className, ...props }: ItalicTextProps) => (
  <i className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const StrongText = ({ className, ...props }: StrongTextProps) => (
  <strong
    className={cn(className, 'PARAGRAPH_SIZES.lead')}
    {...filterProps(props)}
  />
)

const BoldText = ({ className, ...props }: BoldTextProps) => (
  <b
    className={cn(className, 'PARAGRAPH_SIZES.lead')}
    {...filterProps(props)}
  />
)

const UnderlinedText = ({ className, ...props }: UnderlinedTextProps) => (
  <u
    className={cn(className, 'underline', PARAGRAPH_SIZES.lead)}
    {...filterProps(props)}
  />
)

const DeletedText = ({ className, ...props }: DeletedTextProps) => (
  <del
    className={cn(className, 'text-muted line-through', PARAGRAPH_SIZES.lead)}
    {...filterProps(props)}
  />
)

const HorizontalRule = ({ className, ...props }: HorizontalRuleProps) => (
  <hr
    className={cn(className, 'mx-auto w-48 border-b border-border')}
    {...filterProps(props)}
  />
)

const Blockquote = ({ className, ...props }: BlockquoteProps) => (
  <blockquote
    className={cn(className, PARAGRAPH_SIZES.lead)}
    {...filterProps(props)}
  />
)

const AnchorLink = ({ className, ...props }: AnchorLinkProps) => (
  <a
    className={cn(className, 'cursor-pointer text-xs underline')}
    target="_blank"
    rel="noopener noreferrer"
    {...filterProps(props)}
  />
)

const Heading1 = ({ className, ...props }: HeadingProps) => (
  <h1 className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const Heading2 = ({ className, ...props }: HeadingProps) => (
  <h2 className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const Heading3 = ({ className, ...props }: HeadingProps) => (
  <h3 className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const Heading4 = ({ className, ...props }: HeadingProps) => (
  <h4 className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const Heading5 = ({ className, ...props }: HeadingProps) => (
  <h5 className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const Heading6 = ({ className, ...props }: HeadingProps) => (
  <h6 className={cn(className, PARAGRAPH_SIZES.lead)} {...filterProps(props)} />
)

const Img = ({ src, alt }: ImgProps) => {
  const [error, setError] = useState(false)

  if (!src) return null
  
  // Ensure src is a string for Next.js Image component
  const imageSrc = typeof src === 'string' ? src : URL.createObjectURL(src as Blob);

  return (
    <div className="w-full max-w-xl">
      {error ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md bg-secondary/50 text-muted">
          <Paragraph className="text-primary">Image unavailable</Paragraph>
          <Link
            href={String(src)}
            target="_blank"
            className="max-w-md truncate underline"
          >
            {String(src)}
          </Link>
        </div>
      ) : (
        <Image
          src={imageSrc}
          width={96}
          height={56}
          alt={alt ?? 'Rendered image'}
          className="size-full rounded-md object-cover"
          onError={() => setError(true)}
          unoptimized
        />
      )}
    </div>
  )
}

interface CodeBlockProps {
  className?: string;
  children?: string;
}

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactElement<CodeBlockProps>;
}

const Pre: React.FC<CodeProps> = ({ className, children, ...rest }) => {
  // Check if this is a code block with language
  if (
    children &&
    children.props &&
    children.props.className &&
    typeof children.props.className === 'string'
  ) {
    const language = children.props.className.replace('language-', '');
    
    // If it's a mermaid diagram
    if (language === 'mermaid' && typeof children.props.children === 'string') {
      return <MermaidRenderer chart={children.props.children} />;
    }
  }
  
  // Default code block rendering
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-md bg-background-secondary/50 p-4 text-sm',
        className
      )}
      {...filterProps(rest)}
    >
      {children}
    </pre>
  );
};

export const inlineComponents = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  ul: UnorderedList,
  ol: OrderedList,
  em: EmphasizedText,
  i: ItalicText,
  strong: StrongText,
  b: BoldText,
  u: UnderlinedText,
  del: DeletedText,
  hr: HorizontalRule,
  blockquote: Blockquote,
  a: AnchorLink,
  img: Img,
  p: Paragraph,
  pre: Pre
}
