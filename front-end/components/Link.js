/* eslint-disable jsx-a11y/anchor-has-content */
import Link from 'next/link';

const CustomLink = ({ href, newTab = false, ...rest }) => {
  const isInternalLink = href && href.startsWith('/');
  const isAnchorLink = href && href.startsWith('#');
  const isValidHref = href && href.trim() !== '';

  const target = newTab ? '_blank' : '_self';
  const rel = newTab ? 'noopener noreferrer' : '';

  if (isInternalLink) {
    // Next.js Link does not support target; it must be applied to the <a> tag inside
    return (
      <Link href={href}>
        <a target={target} rel={rel} {...rest} />
      </Link>
    );
  }

  if (isAnchorLink) {
    return <a href={href} target={target} rel={rel} {...rest} />;
  }

  if (isValidHref) {
    return (
      <a
        href={href}
        className="special-underline-new no-underline hover:text-gray-100 dark:hover:text-gray-100"
        target={target}
        rel={rel}
        {...rest}
      />
    );
  }

  return (
    <a
      className="special-underline-new no-underline hover:text-gray-100 dark:hover:text-gray-100"
      href={href}
      target={target}
      rel={rel}
      {...rest}
    />
  );
};

export default CustomLink;
