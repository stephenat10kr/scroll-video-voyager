
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			transitionDuration: {
				'1500': '1500ms',
			},
			fontFamily: {
				'gt-super': ['Dahlia-Regular', 'serif'],
				'sans': ['Cabin', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', "Noto Sans", 'sans-serif'],
			},
			fontSize: {
				// Title-XL (updated)
				'title-xl': ['112px', {
					lineHeight: '1.1',
					letterSpacing: '-0.02em',
					fontWeight: 'normal',
				}],
				'title-xl-mobile': ['72px', {
					lineHeight: '1.1',
					letterSpacing: '-0.02em',
					fontWeight: 'normal',
				}],
				
				// Title-Lg (updated)
				'title-lg': ['96px', {
					lineHeight: '1.1',
					letterSpacing: '-0.02em',
					fontWeight: 'normal',
				}],
				'title-lg-mobile': ['56px', {
					lineHeight: '1.1',
					letterSpacing: '-0.02em',
					fontWeight: 'normal',
				}],
				
				// Title-Md
				'title-md': ['72px', {
					lineHeight: '1.1',
					letterSpacing: '-0.02em',
					fontWeight: 'normal',
				}],
				'title-md-mobile': ['48px', {
					lineHeight: '1.1',
					letterSpacing: '-0.02em',
					fontWeight: 'normal',
				}],
				
				// Title-Sm
				'title-sm': ['20px', {
					lineHeight: '1.4',
					fontWeight: '400',
				}],
				'title-sm-mobile': ['18px', {
					lineHeight: '1.4',
					fontWeight: '400',
				}],
				
				// Body
				'body': ['20px', {
					lineHeight: '1.6',
					fontWeight: '400',
				}],
				'body-mobile': ['18px', {
					lineHeight: '1.6',
					fontWeight: '400',
				}],
				
				// Body-Sm
				'body-sm': ['16px', {
					lineHeight: '1.4',
					fontWeight: '400',
				}],
				'body-sm-mobile': ['14px', {
					lineHeight: '1.4',
					fontWeight: '400',
				}],
			},
			colors: {
				roseWhite: '#FFF4F1',
				darkGreen: '#203435',
				coral: '#FFB577',
				
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
