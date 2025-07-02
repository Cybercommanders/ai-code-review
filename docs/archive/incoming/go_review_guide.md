# Go (Golang) Code Review Guide - Comprehensive Best Practices

## Language-Specific Framework for AI Code Review Tool

This guide provides comprehensive patterns, anti-patterns, and detection criteria for reviewing Go code across multiple review types: Architectural, Quick Fixes, Security, Performance, Unused Code Detection, and Developer Evaluation.

---

## 1. Architectural Review - Go Patterns

### 1.1 Project Structure and Organization

**Standard Go Project Layout:**
- `cmd/` - Main entry points for applications
- `pkg/` - Library code for external applications
- `internal/` - Private application and library code
- `api/` - API definitions (OpenAPI, Protocol Buffers)
- `configs/` - Configuration file templates
- `test/` - Additional external test apps and test data

**Check for:**
- Proper separation of concerns between packages
- Adherence to standard Go project layout
- Circular import detection
- Package naming conventions (lowercase, no underscores)

### 1.2 Dependency Management and Architecture Patterns

**Hexagonal Architecture (Ports & Adapters):**
```go
// Good: Clean separation of concerns
type UserService interface {
    CreateUser(ctx context.Context, user User) error
    GetUser(ctx context.Context, id string) (User, error)
}

type UserRepository interface {
    Save(ctx context.Context, user User) error
    FindByID(ctx context.Context, id string) (User, error)
}

// Implementation depends on abstractions, not concretions
type userService struct {
    repo UserRepository
    logger Logger
}
```

**Anti-patterns to flag:**
- God packages (packages doing too many things)
- Tight coupling between business logic and infrastructure
- Missing interfaces for testability
- Inappropriate use of `internal/` vs `pkg/`

### 1.3 Interface Design and SOLID Principles

**Interface Segregation:**
```go
// Good: Small, focused interfaces
type Reader interface {
    Read([]byte) (int, error)
}

type Writer interface {
    Write([]byte) (int, error)
}

// Bad: Fat interfaces
type FileHandler interface {
    Read([]byte) (int, error)
    Write([]byte) (int, error)
    Seek(int64, int) (int64, error)
    Stat() (FileInfo, error)
    Close() error
    // ... many more methods
}
```

**Dependency Inversion:**
- Check for constructor injection patterns
- Verify interfaces are defined by consumers, not providers
- Look for proper abstraction layers

### 1.4 Concurrency Architecture

**Goroutine Management Patterns:**
- Worker pools with bounded concurrency
- Fan-in/Fan-out patterns
- Pipeline patterns using channels
- Context propagation for cancellation

**Red flags:**
- Unbounded goroutine creation
- Missing goroutine lifecycle management
- Shared state without proper synchronization
- Channels used where simpler sync primitives would suffice

### 1.5 OSS Integration Opportunities

**Assess opportunities to leverage established packages:**
- Logging: `github.com/sirupsen/logrus`, `go.uber.org/zap`
- HTTP routing: `github.com/gorilla/mux`, `github.com/gin-gonic/gin`
- Configuration: `github.com/spf13/viper`
- Testing: `github.com/stretchr/testify`
- Database: `gorm.io/gorm` for ORM, `github.com/jmoiron/sqlx` for SQL
- Validation: `github.com/go-playground/validator`

---

## 2. Quick Fixes Review - Go Specific Improvements

### 2.1 Idiomatic Go Patterns

**Variable Declaration and Initialization:**
```go
// Good: Short variable declarations
if err := someOperation(); err != nil {
    return err
}

// Good: Multiple assignments
name, age := getPersonDetails()

// Bad: Unnecessary var declarations
var err error
err = someOperation()
if err != nil {
    return err
}
```

**Function Naming and Conventions:**
- Exported functions: PascalCase (`GetUser`, `CreateOrder`)
- Unexported functions: camelCase (`validateEmail`, `parseConfig`)
- Interface names: often end in `-er` (`Reader`, `Writer`, `Handler`)

### 2.2 Error Handling Improvements

**Proper Error Wrapping (Go 1.13+):**
```go
// Good: Error wrapping with context
if err := database.Save(user); err != nil {
    return fmt.Errorf("failed to save user %s: %w", user.ID, err)
}

// Bad: Lost error context
if err := database.Save(user); err != nil {
    return errors.New("database error")
}
```

**Custom Error Types:**
```go
// Good: Structured error handling
type ValidationError struct {
    Field   string
    Message string
}

func (e ValidationError) Error() string {
    return fmt.Sprintf("validation failed for %s: %s", e.Field, e.Message)
}
```

### 2.3 Quick Wins for Code Quality

**String Building:**
```go
// Good: Use strings.Builder for concatenation
var builder strings.Builder
for _, item := range items {
    builder.WriteString(item)
}
result := builder.String()

// Bad: String concatenation in loops
var result string
for _, item := range items {
    result += item // Creates new string each iteration
}
```

**Slice Operations:**
```go
// Good: Pre-allocate slices when size is known
items := make([]Item, 0, expectedSize)

// Good: Check slice bounds
if len(slice) > 0 {
    first := slice[0]
}
```

### 2.4 Magic Numbers and Constants

```go
// Good: Named constants
const (
    DefaultTimeout = 30 * time.Second
    MaxRetries     = 3
    BufferSize     = 1024
)

// Bad: Magic numbers
time.Sleep(30000000000) // What is this duration?
if len(buffer) > 1024 { // Why 1024?
```

---

## 3. Security Review - Go OWASP Alignment

### 3.1 Input Validation and Sanitization

**SQL Injection Prevention:**
```go
// Good: Parameterized queries
query := "SELECT * FROM users WHERE id = $1 AND status = $2"
rows, err := db.Query(query, userID, status)

// Bad: String concatenation
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userID)
```

**Command Injection Prevention:**
```go
// Good: Proper command execution
cmd := exec.Command("ls", "-la", userInput)
output, err := cmd.Output()

// Bad: Shell injection vulnerability
cmd := exec.Command("sh", "-c", "ls -la "+userInput)
```

### 3.2 Authentication and Authorization

**Secure Session Management:**
```go
// Good: Secure cookie settings
http.SetCookie(w, &http.Cookie{
    Name:     "session",
    Value:    sessionToken,
    HttpOnly: true,
    Secure:   true,
    SameSite: http.SameSiteStrictMode,
    MaxAge:   3600,
})

// Bad: Insecure cookie
http.SetCookie(w, &http.Cookie{
    Name:  "session",
    Value: sessionToken,
    // Missing security flags
})
```

**JWT Token Handling:**
```go
// Check for:
// - Proper token validation
// - Secure signing algorithms (RS256, not HS256 with weak secrets)
// - Token expiration checks
// - Proper secret management
```

### 3.3 Cryptographic Security

**Secure Random Generation:**
```go
// Good: Cryptographically secure random
import "crypto/rand"

token := make([]byte, 32)
_, err := crypto_rand.Read(token)
if err != nil {
    return err
}

// Bad: Predictable random
import "math/rand"
token := rand.Int63() // Predictable
```

**Password Hashing:**
```go
// Good: bcrypt for password hashing
import "golang.org/x/crypto/bcrypt"

hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

// Bad: Weak hashing
hasher := md5.New()
hasher.Write([]byte(password))
hash := hex.EncodeToString(hasher.Sum(nil))
```

### 3.4 Data Exposure Prevention

**Sensitive Data in Logs:**
```go
// Good: Sanitized logging
log.Printf("User login attempt for user ID: %s", user.ID)

// Bad: Sensitive data exposure
log.Printf("User login: %+v", user) // May contain passwords, tokens
```

**Environment Variable Security:**
```go
// Good: Secure config loading
func loadConfig() Config {
    return Config{
        DatabaseURL: os.Getenv("DATABASE_URL"),
        APIKey:      os.Getenv("API_KEY"),
        // Never log these values
    }
}
```

---

## 4. Performance Review - Go Optimization

### 4.1 Memory Management and Allocation

**Slice and Map Pre-allocation:**
```go
// Good: Pre-allocate when size is known
users := make([]User, 0, expectedCount)
cache := make(map[string]Value, expectedCount)

// Bad: Repeated allocations
var users []User
for range items {
    users = append(users, processItem()) // May cause multiple reallocations
}
```

**String Performance:**
```go
// Good: strings.Builder for concatenation
var builder strings.Builder
builder.Grow(estimatedSize) // Pre-allocate buffer
for _, s := range strings {
    builder.WriteString(s)
}

// Bad: String concatenation
var result string
for _, s := range strings {
    result += s // O(n²) complexity
}
```

### 4.2 Goroutine and Channel Optimization

**Worker Pool Pattern:**
```go
// Good: Bounded concurrency
func processItems(items []Item) {
    jobs := make(chan Item, len(items))
    results := make(chan Result, len(items))
    
    // Start fixed number of workers
    workers := runtime.NumCPU()
    for w := 0; w < workers; w++ {
        go worker(jobs, results)
    }
    
    // Send jobs
    for _, item := range items {
        jobs <- item
    }
    close(jobs)
    
    // Collect results
    for range items {
        <-results
    }
}

// Bad: Unbounded goroutines
for _, item := range items {
    go processItem(item) // May create thousands of goroutines
}
```

**Channel Buffer Sizing:**
```go
// Good: Appropriately sized buffers
results := make(chan Result, runtime.NumCPU())

// Consider:
// - Unbuffered for synchronous communication
// - Small buffer (1-10) for decoupling
// - Larger buffer for producer/consumer rate differences
```

### 4.3 Algorithm Complexity

**Map vs Slice for Lookups:**
```go
// Good: Use map for O(1) lookups
userMap := make(map[string]User)
for _, user := range users {
    userMap[user.ID] = user
}

if user, exists := userMap[targetID]; exists {
    // Found in O(1)
}

// Bad: Linear search O(n)
var foundUser User
for _, user := range users {
    if user.ID == targetID {
        foundUser = user
        break
    }
}
```

### 4.4 I/O and Network Optimization

**Connection Pooling:**
```go
// Good: Reuse HTTP client with connection pooling
var httpClient = &http.Client{
    Timeout: 30 * time.Second,
    Transport: &http.Transport{
        MaxIdleConns:        100,
        MaxIdleConnsPerHost: 10,
        IdleConnTimeout:     90 * time.Second,
    },
}
```

**Buffered I/O:**
```go
// Good: Buffered reading
file, err := os.Open("large-file.txt")
if err != nil {
    return err
}
defer file.Close()

scanner := bufio.NewScanner(file)
for scanner.Scan() {
    processLine(scanner.Text())
}

// Bad: Unbuffered byte-by-byte reading
```

---

## 5. Unused Code Detection - Go Specific Patterns

### 5.1 Function and Method Detection

**Unreachable Functions:**
- Private functions not called within package
- Public functions not used in any imported packages
- Methods never invoked through interfaces

**Static Analysis Tools Integration:**
- `deadcode` - Official Go tool for unreachable function detection
- `staticcheck -checks U1000` - Unused code detection
- `ineffassign` - Unused assignments

### 5.2 Variable and Import Analysis

**Unused Variables:**
```go
// Flaggable: Unused variables
func processData() {
    unusedVar := "never used"
    data := getData()
    return process(data)
}

// Flaggable: Unused imports
import (
    "fmt"     // Used
    "strings" // Never used - should be removed
)
```

**Blank Identifier Usage:**
```go
// Intentionally unused (acceptable)
_, err := operation()
if err != nil {
    return err
}

// Potentially problematic
result, _ := operation() // Ignoring error
```

### 5.3 Dead Code Patterns

**Unreachable Code:**
```go
// Flaggable: Code after return
func example() {
    return
    fmt.Println("This will never execute")
}

// Flaggable: Impossible conditions
if false {
    // Dead code
}
```

**Unused Struct Fields:**
```go
type User struct {
    ID       string
    Name     string
    internal string // Never accessed
}
```

### 5.4 Build Tag Analysis

**Conditional Compilation:**
```go
//go:build !production
// +build !production

// This code only exists in non-production builds
func debugFunction() {
    // Implementation
}
```

Check for code that might be dead in specific build configurations.

---

## 6. Developer Evaluation - Go Skill Assessment

### 6.1 Skill Level Indicators

**Beginner Patterns:**
- Basic syntax without idiomatic patterns
- Minimal error handling
- No interfaces or basic struct usage
- Simple variable naming (single letters)
- Copy-paste patterns without understanding

```go
// Beginner indicator: Poor error handling
func GetUser(id string) User {
    user := database.Find(id) // No error checking
    return user
}

// Beginner indicator: No interfaces
type DatabaseConnection struct {
    // Direct dependency on concrete type
}
```

**Intermediate Patterns:**
- Proper error handling with context
- Interface usage for abstraction
- Understanding of goroutines and channels
- Proper package organization
- Some performance considerations

```go
// Intermediate indicator: Good error handling
func GetUser(ctx context.Context, id string) (*User, error) {
    if id == "" {
        return nil, fmt.Errorf("user ID cannot be empty")
    }
    
    user, err := r.db.FindUser(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user %s: %w", id, err)
    }
    
    return user, nil
}

// Intermediate indicator: Interface usage
type UserRepository interface {
    FindUser(ctx context.Context, id string) (*User, error)
}
```

**Advanced Patterns:**
- Advanced concurrency patterns (worker pools, pipelines)
- Custom interfaces and design patterns
- Performance optimization awareness
- Proper testing strategies
- Context propagation

```go
// Advanced indicator: Sophisticated concurrency
func (p *Processor) ProcessBatch(ctx context.Context, items []Item) error {
    ctx, cancel := context.WithCancel(ctx)
    defer cancel()
    
    jobs := make(chan Item, len(items))
    results := make(chan Result, len(items))
    
    // Start workers
    workers := runtime.NumCPU()
    var wg sync.WaitGroup
    
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for item := range jobs {
                select {
                case <-ctx.Done():
                    return
                case results <- p.processItem(ctx, item):
                }
            }
        }()
    }
    
    // Send work
    go func() {
        defer close(jobs)
        for _, item := range items {
            select {
            case <-ctx.Done():
                return
            case jobs <- item:
            }
        }
    }()
    
    // Collect results
    go func() {
        wg.Wait()
        close(results)
    }()
    
    for result := range results {
        if result.Error != nil {
            cancel()
            return result.Error
        }
    }
    
    return ctx.Err()
}
```

### 6.2 AI Assistance Detection Patterns

**High AI Assistance Likelihood:**
- Overly verbose comments explaining obvious code
- Generic variable names in specific contexts
- Complex solutions to simple problems
- Perfect syntax with poor logical structure
- Inconsistent coding style within files

```go
// AI-generated indicator: Over-commenting obvious code
func AddNumbers(a int, b int) int {
    // This function takes two integer parameters a and b
    // It performs addition operation on these two numbers
    // The result is stored in the sum variable
    sum := a + b
    // Return the calculated sum to the caller
    return sum
}

// AI-generated indicator: Over-engineered simple function
func CheckIfEven(number int) bool {
    // Complex logic for simple check
    if number%2 == 0 {
        return true
    } else {
        return false
    }
}
```

**Low AI Assistance Likelihood:**
- Consistent personal style
- Context-aware optimizations
- Natural comment style
- Appropriate complexity for problem scope

```go
// Human indicator: Concise, contextual code
func (s *Server) authenticateUser(r *http.Request) (*User, error) {
    token := r.Header.Get("Authorization")
    if token == "" {
        return nil, ErrNoToken
    }
    
    return s.tokenService.ValidateToken(strings.TrimPrefix(token, "Bearer "))
}
```

### 6.3 Professional Development Indicators

**Senior/Professional Markers:**
- Proper configuration management
- Security-first approach
- Comprehensive error handling
- Testing strategy consideration
- Documentation for public APIs

```go
// Professional indicator: Configuration management
type Config struct {
    DatabaseURL  string `env:"DATABASE_URL,required"`
    Port         int    `env:"PORT" envDefault:"8080"`
    LogLevel     string `env:"LOG_LEVEL" envDefault:"info"`
    ReadTimeout  time.Duration `env:"READ_TIMEOUT" envDefault:"10s"`
    WriteTimeout time.Duration `env:"WRITE_TIMEOUT" envDefault:"10s"`
}

// Professional indicator: Structured error handling
type APIError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Details any    `json:"details,omitempty"`
}

func (e APIError) Error() string {
    return e.Message
}
```

**Individual/Learning Markers:**
- Focus on getting features working
- Limited error handling
- Minimal testing consideration
- Basic security practices

### 6.4 Context Assessment Patterns

**Working Environment Indicators:**
- Individual: Simple, direct solutions
- Team: Interface usage, shared patterns
- Enterprise: Comprehensive error handling, logging, monitoring

**Time Constraints:**
- Rushed: TODO comments, placeholder implementations
- Balanced: Good structure with room for improvement
- Thorough: Comprehensive testing, documentation, edge cases

---

## 7. Go-Specific Anti-Patterns and Red Flags

### 7.1 Common Anti-Patterns

**Goroutine Leaks:**
```go
// Bad: Goroutine may never terminate
func badPattern() {
    go func() {
        for {
            // Infinite loop without exit condition
            doWork()
        }
    }()
}

// Good: Proper lifecycle management
func goodPattern(ctx context.Context) {
    go func() {
        for {
            select {
            case <-ctx.Done():
                return
            default:
                doWork()
            }
        }
    }()
}
```

**Interface Pollution:**
```go
// Bad: Premature interface extraction
type UserService interface {
    CreateUser(User) error
    // Only one implementation exists
}

// Good: Interface when needed
// Define interface when you have multiple implementations
// or when testing requires mocking
```

**Panic in Production Code:**
```go
// Bad: Panic for recoverable errors
func getUser(id string) User {
    if id == "" {
        panic("ID cannot be empty") // Don't panic for validation
    }
    return findUser(id)
}

// Good: Return errors
func getUser(id string) (*User, error) {
    if id == "" {
        return nil, errors.New("ID cannot be empty")
    }
    return findUser(id)
}
```

### 7.2 Performance Anti-Patterns

**Inefficient String Operations:**
```go
// Bad: String concatenation in loop
var result string
for _, item := range items {
    result += item // O(n²) complexity
}

// Good: strings.Builder
var builder strings.Builder
for _, item := range items {
    builder.WriteString(item)
}
result := builder.String()
```

**Memory Leaks:**
```go
// Bad: Slice memory leak
func processLargeSlice(data []byte) []byte {
    // Returns small slice but keeps large underlying array
    return data[:10]
}

// Good: Copy to new slice
func processLargeSlice(data []byte) []byte {
    result := make([]byte, 10)
    copy(result, data[:10])
    return result
}
```

---

## 8. Integration with AI Code Review Tool

### 8.1 Prompt Template Adaptations

For each review type, adapt the base prompts to include:

1. **Go-specific syntax patterns** mentioned above
2. **Standard library usage** patterns
3. **Community conventions** from effective Go guidelines
4. **Performance characteristics** specific to Go runtime
5. **Security patterns** aligned with Go security best practices

### 8.2 Confidence Scoring Criteria

**High Confidence Issues (90%+):**
- Syntax errors or compilation issues
- Clear security vulnerabilities (SQL injection, XSS)
- Obvious performance problems (string concatenation in loops)
- Goroutine leaks with infinite loops

**Medium Confidence Issues (70-89%):**
- Design pattern violations
- Missing error handling
- Inefficient algorithms
- Interface design issues

**Low Confidence Issues (50-69%):**
- Style preferences
- Architecture suggestions
- Potential optimizations
- Code organization recommendations

### 8.3 Framework-Specific Extensions

When detecting Go frameworks/libraries, include specific patterns:

**Gin Framework:**
- Route handler patterns
- Middleware usage
- Context binding patterns

**Fiber Framework:**
- Handler function signatures
- Middleware patterns
- Performance considerations

**GORM:**
- Query optimization
- Relationship handling
- Migration patterns

**Testify:**
- Test structure patterns
- Mock usage
- Assertion patterns

---

This comprehensive guide provides the foundation for creating Go-specific review prompts that can accurately assess code quality, security, performance, and developer skill level while identifying unused code and architectural improvements.