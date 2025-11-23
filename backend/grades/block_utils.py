"""
Shared visualization utilities for block-based math problems
Used by multiple grades with different block section counts
"""

def create_blocks(num, sections_per_block=5):
    """
    Create a block representation for a number.
    
    Args:
        num: The number to represent
        sections_per_block: Number of sections in each block (5 or 10)
    
    Returns:
        {
            'full_blocks': Number of completely filled blocks,
            'remainder': Number of sections in partial block (0 if no partial),
            'total': Total number (input)
        }
    
    Example (5 sections):
        create_blocks(7, 5) -> {full_blocks: 1, remainder: 2, total: 7}
        # One complete block (5 sections) + one partial block (2 sections)
    
    Example (10 sections):
        create_blocks(17, 10) -> {full_blocks: 1, remainder: 7, total: 17}
        # One complete block (10 sections) + one partial block (7 sections)
    """
    full_blocks = num // sections_per_block
    remainder = num % sections_per_block
    
    return {
        'full_blocks': full_blocks,
        'remainder': remainder,
        'total': num
    }
