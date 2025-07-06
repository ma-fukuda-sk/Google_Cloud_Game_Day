import { HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'blue' | 'green' | 'gray' | 'red'
  size?: 'sm' | 'md'
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        
        // Variant styles
        {
          'bg-gray-100 text-gray-800': variant === 'default' || variant === 'gray',
          'bg-green-100 text-green-800': variant === 'success' || variant === 'green',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'error' || variant === 'red',
          'bg-blue-100 text-blue-800': variant === 'info' || variant === 'blue',
        },
        
        // Size styles
        {
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}