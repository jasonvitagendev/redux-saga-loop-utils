export const timeout = (duration: number) =>
    new Promise(resolve => setTimeout(resolve, duration))
