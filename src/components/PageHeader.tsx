interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <div className="bg-primary pt-24 pb-12">
    <div className="container mx-auto px-4">
      <h1 className="font-display text-4xl md:text-5xl text-primary-foreground tracking-wide">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-primary-foreground/70 font-body text-lg">{subtitle}</p>
      )}
      <div className="w-16 h-1 bg-secondary mt-4 rounded-full" />
    </div>
  </div>
);

export default PageHeader;
