import { Button } from '@natcore/design-system-react';

export default function ButtonPage() {
  return (
    <>
      <div className='grid grid-cols-5 gap-x-3 gap-y-10'>
        <Button variant='solid' color='primary'>
          Button
        </Button>
        <Button variant='solid' color='secondary'>
          Button
        </Button>
        <Button variant='solid' color='tertiary'>
          Button
        </Button>
        <Button variant='solid' color='warning'>
          Button
        </Button>
        <Button variant='solid' color='danger'>
          Button
        </Button>

        <Button variant='outline' color='primary'>
          Button
        </Button>
        <Button variant='outline' color='secondary'>
          Button
        </Button>
        <Button variant='outline' color='tertiary'>
          Button
        </Button>
        <Button variant='outline' color='warning'>
          Button
        </Button>
        <Button variant='outline' color='danger'>
          Button
        </Button>
      </div>

      <div>
        <Button variant='outline' color='primary' size='sm'>
          Button
        </Button>
        <Button variant='outline' color='secondary' size='md'>
          Button
        </Button>
        <Button variant='outline' color='tertiary' size='lg'>
          Button
        </Button>
      </div>

      <div className='card'>TEST</div>
    </>
  );
}
