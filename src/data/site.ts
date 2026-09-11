export const site = {
    name: "Brock Shaffer",
    handle: "broski-lib",
    role: "Electrical & Computer Engineering",
    org: "The Ohio State University",
    email: "contact@brockshaffer.dev",
    phone: "(614) 595-6689",
    location: "Columbus, OH",
    github: "https://github.com/broski-lib",
    linkedin: "https://www.linkedin.com/in/brockshaffer",
    heroImageKey: "General/sp1_iuncqb.jpg",
} as const;

export interface NavItem {
    label: string;
    href: string;
    index: string;
}

export const nav: NavItem[] = [
    { label: "Home", href: "/", index: "00" },
    { label: "Gallery", href: "/gallery", index: "01" },
    { label: "About", href: "/about", index: "02" },
];
