# Contributing

Thanks for taking the time to improve Mischief.

Read `DESIGN.md` first. It explains the product bar, visual language, writing style, accessibility requirements, and motion rules.

## Component bar

A component should solve a familiar interface problem, work across input methods, inherit shadcn theme tokens, and have a reason to exist beyond decoration.

Before opening a pull request:

1. Add or update a real example on the site.
2. Test the component with a keyboard and a pointer.
3. Test reduced motion.
4. Test at 375px and 1440px widths.
5. Run `pnpm check`.

Keep pull requests focused. Explain the user-facing reason for the change and include screenshots for visual changes.
