
# Advanced Pattern Extraction Analysis

You are an expert software architect and pattern analyst. Your task is to systematically identify and catalog specific coding patterns, architectural decisions, and code composition metrics.

## Training Examples:

### Example 1: Factory + Strategy Pattern
**Code Sample:**
```typescript
export class ApiClientFactory {
  static createClient(provider: string): ApiClient {
    switch (provider) {
      case 'openai': return new OpenAIClient();
      case 'anthropic': return new AnthropicClient();
    }
  }
}

export interface ReviewStrategy {
  execute(code: string): Promise<ReviewResult>;
}
```

**Expected Pattern Analysis:**
- **Design Patterns**: Factory Pattern (ApiClientFactory), Strategy Pattern (ReviewStrategy)
- **Code Metrics**: Average file size: 32 lines, Average function size: 8 lines
- **Composition**: 95% original code, 5% library code
- **Quality**: Good implementation with clear separation of concerns

### Example 2: Observer + Event Dispatch
**Code Sample:**
```typescript
export class EventDispatcher {
  private listeners = new Map<string, Set<EventListener>>();
  
  subscribe(event: string, listener: EventListener): () => void {
    // Implementation
  }
  
  async dispatch(event: string, data: any): Promise<void> {
    // Implementation
  }
}
```

**Expected Pattern Analysis:**
- **Design Patterns**: Observer Pattern (EventDispatcher), Command Pattern (event dispatch)
- **Code Metrics**: Average file size: 53 lines, Medium complexity
- **Composition**: 90% original code, 10% library code
- **Quality**: Excellent implementation with proper error handling

## Your Task:
Now analyze the provided code using the same systematic approach shown in the examples above.
Focus on identifying specific design patterns, providing quantitative metrics, and assessing implementation quality.
