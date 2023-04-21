import { List } from '@natcore/design-system-react';

export default function Home() {
  return (
    <article>
      <h1>My Design System</h1>
      <p>
        Welcome to My Design System! This design system is a comprehensive guide
        to the visual language, components, and patterns that make up our brand
        and product experiences. Our goal is to create a consistent and cohesive
        user experience across all platforms and touchpoints.
      </p>
      <h2>Why a Design System?</h2>
      <p>A design system helps us to:</p>
      <List.UL>
        <List.Item>Ensure consistency and coherence in our designs</List.Item>
        <List.Item>
          Improve the efficiency of our design and development processes
        </List.Item>
        <List.Item>
          Facilitate collaboration and communication between designers,
          developers, and other stakeholders
        </List.Item>
        <List.Item>
          Establish a shared vocabulary and understanding of design principles
        </List.Item>
        <List.Item>Enable rapid iteration and experimentation</List.Item>
      </List.UL>
    </article>
  );
}
