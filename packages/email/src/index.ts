// Phase 2 stub — React Email templates will live here
export interface WelcomeEmailProps {
  name: string;
}

export function getWelcomeEmailSubject(): string {
  return 'Welcome to JobOS';
}

export function getWelcomeEmailText(props: WelcomeEmailProps): string {
  return `Hi ${props.name},\n\nWelcome to JobOS — your career operating system.`;
}
