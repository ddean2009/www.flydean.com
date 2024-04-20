# 二分查找


## [35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/)

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 `O(log n)` 的算法。

解法二分插入：

```java
class Solution {
    public int searchInsert(int[] nums, int target) {
        int left=0; 
        int right = nums.length-1;
        while(left <=right){
            int mid=(left+right)/2;
            if(nums[mid]<target){
                left=mid+1;
            }else{
                right=mid-1;
            } 
        }
        return left; 
    }
}
```

## [74. 搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/)

给你一个满足下述两条属性的 `m x n` 整数矩阵：

- 每行中的整数从左到右按非严格递增顺序排列。
- 每行的第一个整数大于前一行的最后一个整数。

给你一个整数 `target` ，如果 `target` 在矩阵中，返回 `true` ；否则，返回 `false` 。

二分查找。把矩阵看做是一个一维数组。

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {

        int m=matrix.length;
        int n=matrix[0].length;
        int size=m*n;
        int left=0;
        int right=size-1;
        while(left <=right){
            int mid= (left+right)/2;
            if(matrix[mid/n][mid%n]==target){
                return true;
            }else if(matrix[mid/n][mid%n]<target){
                left=mid+1;
            }else{
                right=mid-1;
            }
        }
        return false;

    }
}
```

解法2：两次二分。可以对矩阵的第一列的元素二分查找，找到最后一个不大于目标值的元素，然后在该元素所在行中二分查找目标值是否存在。

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int rowIndex = binarySearchFirstColumn(matrix, target);
        if (rowIndex < 0) {
            return false;
        }
        return binarySearchRow(matrix[rowIndex], target);
    }

    public int binarySearchFirstColumn(int[][] matrix, int target) {
        int low = -1, high = matrix.length - 1;
        while (low < high) {
            int mid = (high - low + 1) / 2 + low;
            if (matrix[mid][0] <= target) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }
        return low;
    }

    public boolean binarySearchRow(int[] row, int target) {
        int low = 0, high = row.length - 1;
        while (low <= high) {
            int mid = (high - low) / 2 + low;
            if (row[mid] == target) {
                return true;
            } else if (row[mid] > target) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return false;
    }
}
```

## [162. 寻找峰值](https://leetcode.cn/problems/find-peak-element/)

峰值元素是指其值严格大于左右相邻值的元素。

给你一个整数数组 `nums`，找到峰值元素并返回其索引。数组可能包含多个峰值，在这种情况下，返回 **任何一个峰值** 所在位置即可。

你可以假设 `nums[-1] = nums[n] = -∞` 。

你必须实现时间复杂度为 `O(log n)` 的算法来解决此问题。

解法：1. 寻找最大值。

```java
class Solution {
    public int findPeakElement(int[] nums) {
        int idx = 0;
        for (int i = 1; i < nums.length; ++i) {
            if (nums[i] > nums[idx]) {
                idx = i;
            }
        }
        return idx;
    }
}
```

解法2.方法二的二分查找优化，如果 nums[i] <nums[i+1]，那么我们抛弃 [l,i] 的范围，在剩余 [i+1,r] 的范围内继续随机选取下标；

如果 nums[i]>nums[i+1]，那么我们抛弃 [i,r] 的范围，在剩余 [l,i−1] 的范围内继续随机选取下标。

特别注意，我们给溢出的情况取一个特殊的值。

```java
class Solution {
    public int findPeakElement(int[] nums) {
        int left=0;
        int right=nums.length-1;
        while(left <=right){
            int mid=(left+right)/2;
            if(compare(nums,mid-1, mid)<0 && compare(nums,mid,mid+1)>0){
                return mid;
            }
            if(compare(nums,mid,mid+1)<0){
                left=mid+1;
            }else{
                right=mid-1;
            }
        }
        return -1;
    }

    private int compare(int[] nums, int index1, int index2){
        if(index1==-1){
            return -1;
        }
        if(index2==nums.length){
            return 1;
        }
        if(nums[index1] ==nums[index2]){
            return 0;
        }
        return nums[index1] > nums[index2] ? 1 : -1;

    }
}
```

## [33. 搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

整数数组 `nums` 按升序排列，数组中的值 **互不相同** 。

在传递给函数之前，`nums` 在预先未知的某个下标 `k`（`0 <= k < nums.length`）上进行了 **旋转**，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`（下标 **从 0 开始** 计数）。例如， `[0,1,2,4,5,6,7]` 在下标 `3` 处经旋转后可能变为 `[4,5,6,7,0,1,2]` 。

给你 **旋转后** 的数组 `nums` 和一个整数 `target` ，如果 `nums` 中存在这个目标值 `target` ，则返回它的下标，否则返回 `-1` 。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

解法：我们将数组从中间分开成左右两部分的时候，一定有一部分的数组是有序的。拿示例来看，我们从 6 这个位置分开以后数组变成了 [4, 5, 6] 和 [7, 0, 1, 2] 两个部分，其中左边 [4, 5, 6] 这个部分的数组是有序的，其他也是如此。

这启示我们可以在常规二分查找的时候查看当前 mid 为分割位置分割出来的两个部分 [l, mid] 和 [mid + 1, r] 哪个部分是有序的，并根据有序的那个部分确定我们该如何改变二分查找的上下界，因为我们能够根据有序的那部分判断出 target 在不在这个部分：

如果 [l, mid - 1] 是有序数组，且 target 的大小满足 [nums[l],nums[mid])，则我们应该将搜索范围缩小至 [l, mid - 1]，否则在 [mid + 1, r] 中寻找。
如果 [mid, r] 是有序数组，且 target 的大小满足 (nums[mid+1],nums[r]]，则我们应该将搜索范围缩小至 [mid + 1, r]，否则在 [l, mid - 1] 中寻找。

```java
class Solution {
    public int search(int[] nums, int target) {
        int n = nums.length;
        if (n == 0) {
            return -1;
        }
        if (n == 1) {
            return nums[0] == target ? 0 : -1;
        }
        int l = 0, r = n - 1;
        while (l <= r) {
            int mid = (l + r) / 2;
            if (nums[mid] == target) {
                return mid;
            }
            if (nums[0] <= nums[mid]) {
                if (nums[0] <= target && target < nums[mid]) {
                    r = mid - 1;
                } else {
                    l = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[n - 1]) {
                    l = mid + 1;
                } else {
                    r = mid - 1;
                }
            }
        }
        return -1;
    }
}
```

## [34. 在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

给你一个按照非递减顺序排列的整数数组 `nums`，和一个目标值 `target`。请你找出给定目标值在数组中的开始位置和结束位置。

如果数组中不存在目标值 `target`，返回 `[-1, -1]`。

你必须设计并实现时间复杂度为 `O(log n)` 的算法解决此问题。

解法1.二分查找，单独判断等于的情况，额外挪动位置

```java
class Solution {
  
 // 两次二分查找，分开查找第一个和最后一个
  // 时间复杂度 O(log n), 空间复杂度 O(1)
  // [1,2,3,3,3,3,4,5,9]
  public int[] searchRange(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    int first = -1;
    int last = -1;
    // 找第一个等于target的位置
    while (left <= right) {
      int middle = (left + right) / 2;
      if (nums[middle] == target) {
        first = middle;
        right = middle - 1; //重点
      } else if (nums[middle] > target) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }

    // 最后一个等于target的位置
    left = 0;
    right = nums.length - 1;
    while (left <= right) {
      int middle = (left + right) / 2;
      if (nums[middle] == target) {
        last = middle;
        left = middle + 1; //重点
      } else if (nums[middle] > target) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }

    return new int[]{first, last};
  }
}
```

解法2.常规解法,但是因为target可能不存在，所以需要判断边界情况。边界判断有两种情况1.index越界了。2.target并不存在

```java
class Solution {
  
 // 两次二分查找，分开查找第一个和最后一个
  // 时间复杂度 O(log n), 空间复杂度 O(1)
  // [1,2,3,3,3,3,4,5,9]
  public int[] searchRange(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1;
    int first = -1;
    int last = -1;
    // 找第一个等于target的位置
    while (left <= right) {
      int middle = (left + right) / 2;
      if (nums[middle] < target) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    //边界条件
    if(left<nums.length && nums[left]==target){
      first=left;
    }


    // 最后一个等于target的位置
    left = 0;
    right = nums.length - 1;
    while (left <= right) {
      int middle = (left + right) / 2;
      if (nums[middle] <= target) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }
    //边界条件
    if(right>=0 && nums[right]==target){
      last=right;
    }

    return new int[]{first, last};
  }
}
```



## [153. 寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

已知一个长度为 `n` 的数组，预先按照升序排列，经由 `1` 到 `n` 次 **旋转** 后，得到输入数组。例如，原数组 `nums = [0,1,2,4,5,6,7]` 在变化后可能得到：

- 若旋转 `4` 次，则可以得到 `[4,5,6,7,0,1,2]`
- 若旋转 `7` 次，则可以得到 `[0,1,2,4,5,6,7]`

注意，数组 `[a[0], a[1], a[2], ..., a[n-1]]` **旋转一次** 的结果为数组 `[a[n-1], a[0], a[1], a[2], ..., a[n-2]]` 。

给你一个元素值 **互不相同** 的数组 `nums` ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的 **最小元素** 。

你必须设计一个时间复杂度为 `O(log n)` 的算法解决此问题。

解法：可以二分查找，但是比较的对象不是固定的target而是nums[high]。因为是非特定值的比较，所以使用left < right。

在mid=(left+right)/2的时候，可能会取不到最后的high值。

```java
class Solution {
    public int findMin(int[] nums) {

        int low = 0;
        int high = nums.length - 1;
        while (low < high) {
            int pivot = (high +low) / 2;
            if (nums[pivot] < nums[high]) {
                high = pivot;
            } else {
                low = pivot+1;
            }
        }
        return nums[high];
    }
}
```

因为要找最小值，所以nums[pivot] < nums[high] 或者 nums[pivot] <= nums[high] 都是可以的。

如果 pivot = (high +low) / 2，会遗漏一个high没有移动过的情况没有判断，看看这之后的high满不满足条件。

因为是跟nums[high]进行比较，这个情况已经包含在内了。

另外一种判断方法：pivot = (high +low) / 2 包含了low，nums[pivot] < nums[high]里面判断了high。所以满足条件。

## [4. 寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

给定两个大小分别为 `m` 和 `n` 的正序（从小到大）数组 `nums1` 和 `nums2`。请你找出并返回这两个正序数组的 **中位数** 。

算法的时间复杂度应该为 `O(log (m+n))` 。

把找中位数看作是**寻找第K小的数**。

解法1.使用归并的方式，合并两个有序数组，得到一个大的有序数组。大的有序数组的中间位置的元素，即为中位数。

解法2.如果 A[k/2−1]<B[k/2−1]，则比 A[k/2−1] 小的数最多只有 A 的前 k/2−1个数和 B 的前 k/2−1个数，即比 A[k/2−1]小的数最多只有 k−2 个，因此 A[k/2−1] 不可能是第 k 个数，A[0] 到 A[k/2−1] 也都不可能是第 k 个数，可以全部排除。

如果 A[k/2−1]>B[k/2−1]，则可以排除 B[0] 到 B[k/2−1]。

如果 A[k/2−1]=B[k/2−1]，则可以归入第一种情况处理。



```java
class Solution {
public double findMedianSortedArrays(int[] nums1, int[] nums2) {
    int n = nums1.length;
    int m = nums2.length;
  //找到第K小的数
    int left = (n + m + 1) / 2;
    int right = (n + m + 2) / 2;
    //将偶数和奇数的情况合并，如果是奇数，会求两次同样的 k 。
    return (getKth(nums1, 0, n - 1, nums2, 0, m - 1, left) + getKth(nums1, 0, n - 1, nums2, 0, m - 1, right)) * 0.5;  
}
    
    private int getKth(int[] nums1, int start1, int end1, int[] nums2, int start2, int end2, int k) {
        int len1 = end1 - start1 + 1;
        int len2 = end2 - start2 + 1;
        //让 len1 的长度小于 len2，这样就能保证如果有数组空了，一定是 len1 
        if (len1 > len2) return getKth(nums2, start2, end2, nums1, start1, end1, k);
        if (len1 == 0) return nums2[start2 + k - 1];

        if (k == 1) return Math.min(nums1[start1], nums2[start2]);

        //找到 A[k/2−1]和B[k/2−1]的位置
        int i = start1 + Math.min(len1, k / 2) - 1;
        int j = start2 + Math.min(len2, k / 2) - 1;

        if (nums1[i] > nums2[j]) {
          //如果 A[k/2−1]>B[k/2−1]，则可以排除 B[0] 到 B[k/2−1]
            return getKth(nums1, start1, end1, nums2, j + 1, end2, k - (j - start2 + 1));
        }else {
          //排除A[0] 到 A[k/2−1] 
            return getKth(nums1, i + 1, end1, nums2, start2, end2, k - (i - start1 + 1));
        }
    }

}
```

解法2.划分数组

```java
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // 如果 nums1 的长度大于 nums2 的长度，则调换两个数组，确保 nums1 是较短的数组
        if (nums1.length > nums2.length) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.length;
        int n = nums2.length;
        int left = 0, right = m;
        // median1：前一部分的最大值
        // median2：后一部分的最小值
        int median1 = 0, median2 = 0;

        // 使用二分查找确定分割点
        while (left <= right) {
            // 前一部分包含 nums1[0 .. i-1] 和 nums2[0 .. j-1]
            // 后一部分包含 nums1[i .. m-1] 和 nums2[j .. n-1]
            int i = (left + right) / 2;
            int j = (m + n + 1) / 2 - i;

            // 获取有序数组 nums1 和 nums2 中当前分割点的相邻元素值
            int nums1LeftMax = (i == 0 ? Integer.MIN_VALUE : nums1[i - 1]);
            int nums1RightMin = (i == m ? Integer.MAX_VALUE : nums1[i]);
            int nums2LeftMax = (j == 0 ? Integer.MIN_VALUE : nums2[j - 1]);
            int nums2RightMin = (j == n ? Integer.MAX_VALUE : nums2[j]);

            if (nums1LeftMax <= nums2RightMin) {
                median1 = Math.max(nums1LeftMax, nums2LeftMax);
                median2 = Math.min(nums1RightMin, nums2RightMin);
                left = i + 1; // 移动左边界
            } else {
                right = i - 1; // 移动右边界
            }
        }

        // 根据奇偶情况返回中位数
        return (m + n) % 2 == 0 ? (median1 + median2) / 2.0 : median1;
    }
}

```

