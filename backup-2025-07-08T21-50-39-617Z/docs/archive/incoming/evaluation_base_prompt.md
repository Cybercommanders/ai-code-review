# Code Evaluation Review Prompt (Base Template)

## Review Type: Developer Skill & AI Assistance Assessment

### Objective
Analyze the provided code to assess the developer's skill level, experience, and potential use of AI assistance tools. Provide insights into coding maturity, decision-making quality, and development approach without suggesting improvements.

### Analysis Framework

#### 1. Skill Level Assessment

**Beginner Indicators:**
- Basic syntax usage without advanced language features
- Simple, linear code structure
- Minimal error handling or validation
- Basic variable names (single letters, generic terms)
- Copy-paste patterns or repetitive code blocks
- Limited use of language-specific idioms

**Intermediate Indicators:**
- Proper use of language features and standard libraries
- Some design patterns implementation
- Adequate error handling and input validation
- Reasonable code organization and modularity
- Understanding of framework conventions
- Some performance considerations

**Advanced Indicators:**
- Sophisticated use of language features and advanced patterns
- Custom abstractions and well-designed interfaces
- Comprehensive error handling and edge case management
- Performance-optimized implementations
- Deep framework/library knowledge
- Clean separation of concerns and SOLID principles

#### 2. AI Assistance Detection

**High AI Assistance Likelihood:**
- Overly verbose or unnecessarily complex solutions to simple problems
- Inconsistent coding style within the same file or function
- Generic, boilerplate-heavy implementations
- Comments that seem generated or overly explanatory for obvious code
- Unusual combinations of patterns that don't typically go together
- Missing context-specific optimizations that a human would naturally include
- Perfect syntax with poor logical structure
- Over-engineered solutions for straightforward requirements

**Low AI Assistance Likelihood:**
- Consistent personal coding style and conventions
- Context-aware optimizations and shortcuts
- Natural, conversational comments and documentation
- Efficient solutions that show domain knowledge
- Appropriate complexity for the problem scope
- Evidence of iterative development and refactoring
- Language-specific idioms and community conventions

#### 3. Decision-Making Maturity

**Evaluate:**
- **Library vs. Custom Code Decisions**: Appropriate use of existing solutions vs. reinventing
- **Architecture Choices**: Scalability, maintainability, and simplicity balance
- **Data Structure Selection**: Efficiency and appropriateness for use case
- **Error Handling Strategy**: Comprehensive vs. minimal vs. appropriate
- **Security Considerations**: Awareness of common vulnerabilities
- **Performance Trade-offs**: Understanding of optimization opportunities
- **Documentation Approach**: Clarity, completeness, and target audience awareness

#### 4. Professional Development Indicators

**Senior/Professional Markers:**
- Configuration and environment management
- Proper dependency management and version control awareness
- Security-first approach to data handling
- Logging and monitoring considerations
- Testing strategy (even if tests aren't present)
- Code maintainability and team collaboration focus

**Individual/Learning Markers:**
- Focus on getting features working over long-term maintainability
- Limited consideration of edge cases or production concerns
- Basic security practices or none
- Minimal documentation or configuration management

### Language-Specific Adaptation Points

#### [LANGUAGE_NAME] Specific Indicators

**Skill Level Markers:**
[Insert language-specific skill progression indicators]
- Beginner: [Basic syntax and standard library usage]
- Intermediate: [Framework knowledge and common patterns]
- Advanced: [Deep language features and ecosystem mastery]

**AI Assistance Patterns:**
[Insert language-specific AI-generated code characteristics]
- [Common over-engineering patterns in this language]
- [Typical AI-generated boilerplate or verbose solutions]
- [Language-specific anti-patterns that AI tools commonly produce]

**Professional Practice Indicators:**
[Insert language-specific professional development markers]
- [Standard tooling and configuration practices]
- [Security considerations specific to this language/framework]
- [Performance optimization approaches typical in this ecosystem]

### Output Format

Provide your assessment in the following structure:

## Developer Assessment Summary

### Skill Level: [Beginner/Intermediate/Advanced/Expert]
**Confidence:** [High/Medium/Low]

**Key Evidence:**
- [Specific examples from the code that support this assessment]
- [Notable patterns or decisions that indicate skill level]

### AI Assistance Likelihood: [High/Medium/Low/Minimal]
**Confidence:** [High/Medium/Low]

**Supporting Indicators:**
- [Specific patterns suggesting AI involvement]
- [Evidence for or against AI assistance]

### Professional Maturity: [Junior/Mid-level/Senior/Lead]
**Confidence:** [High/Medium/Low]

**Decision-Making Quality:**
- [Assessment of architectural and implementation choices]
- [Evidence of production readiness and maintainability focus]

### Development Context Assessment
- **Working Environment:** [Individual project/Team collaboration/Enterprise]
- **Time Constraints:** [Rushed/Balanced/Thorough]
- **Experience Domain:** [Learning/Applying known patterns/Innovating]

### Notable Observations
- [Unique strengths or approaches observed]
- [Interesting decisions or trade-offs made]
- [Areas where the developer shows particular expertise or growth]

### Overall Profile
[2-3 sentence summary of the developer's likely background, experience level, and development approach based on the code analysis]

---

**Note:** This assessment is based on code analysis patterns and should be considered alongside other factors when evaluating developer capabilities.