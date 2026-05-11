export default function SectionTitle({
  title,
  description,
}: {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  titleComponent?: React.ReactNode;
}) {
  const titleElement =
    typeof title === "string" ? (
      <h3 className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
        {title}
      </h3>
    ) : (
      title
    );
  const descriptionElement =
    typeof description === "string" ? (
      <p className="text-muted-foreground mt-3 text-sm leading-6 sm:mt-4 sm:text-base md:text-lg md:leading-8">
        {description}
      </p>
    ) : (
      description
    );

  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {titleElement}
      {descriptionElement}
    </div>
  );
}
