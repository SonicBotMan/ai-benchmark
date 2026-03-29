'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-foreground">出错了</h2>
            <p className="mb-4 text-sm text-muted-foreground">页面渲染时发生错误</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
